import { Component, OnInit, inject } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ImageCacheService } from '../services/image-cache.service';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { HttpClientModule } from '@angular/common/http';
import { Message } from '../models/message.model';

@Component({
  selector: 'app-pdf-table',
  templateUrl: './pdf-table.component.html',
  styleUrls: ['./pdf-table.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  providers: [ApiService, ImageCacheService],
})
export class PdfTableComponent implements OnInit {
  messages: Message[] = [];
  imagesUrl: { [key: string]: string } = {};
  imageNames: string[] = [];
  images: string[] = [];
  cachedImages: string[] = [];
  pageSize = 40;
  currentPage = 1;
  totalPages = 1;

  private apiService = inject(ApiService);

  constructor(private imageCacheService: ImageCacheService) {}

  ngOnInit(): void {
    this.loadDataAndGeneratePDF();
  }

  async loadDataAndGeneratePDF(): Promise<void> {
    // try {
    //   const departmentName = 'none';
    //   const fromDate = '2024-08-05 00:00:00';
    //   const toDate = '2024-08-05 23:59:59';

    //   const data = await this.apiService
    //     .getPages(page, this.pageSize, departmentName, fromDate, toDate)
    //     .toPromise();

    //   console.log('API Response:', data);

    //   // Check if data is defined and update state
    //   if (data) {
    //     this.messages = data.message || [];
    //     this.totalPages = 10; // Default to 1 if undefined
    //     this.currentPage = page; // Update current page
    //   } else {
    //     console.warn('No data returned from API');
    //     this.messages = [];
    //     this.totalPages = 1; // Default to 1 if no data
    //   }

    //   console.log('Current Page:', this.currentPage);
    //   console.log('Total Pages:', this.totalPages);
    //   console.log('Messages:', this.messages);

    //   this.imageNames = this.messages
    //     .map((message) => message.imagename)
    //     .flat();
    //   await this.fetchImages();
    //   await this.saveImagesToLocalStorage();
    //   // await this.generatePdf();
    // } catch (error) {
    //   console.error('Error loading data and generating PDF:', error);
    // }

    try {
      const departmentName = 'none';
      const fromDate = '2024-08-05 00:00:00';
      const toDate = '2024-08-05 23:59:59';
      let page = 1;
      const allMessages = [];

      while (true) {
        const data = await this.apiService
          .getPages(page, this.pageSize, departmentName, fromDate, toDate)
          .toPromise();

        // console.log(`API Response for page ${page}:`, data);

        if (data && data.message && data.message.length > 0) {
          allMessages.push(...data.message);
          page++;

          // if (page > this.totalPages) break;
        } else {
          break;
        }
      }

      this.messages = allMessages;
      this.totalPages = page - 1; // Total pages fetched
      console.log('Total Messages:', this.messages);

      // this.imageNames = this.messages
      //   .map((message) => message.imagename)
      //   .flat();
      // await this.fetchImages();
      await this.saveImagesToLocalStorage();
      // await this.generatePdf();
    } catch (error) {
      console.error('Error fetching all pages and generating PDF:', error);
    }
  }

  async fetchImages(): Promise<void> {
    const fetchImagePromises = this.imageNames.map((imageName) =>
      this.apiService
        .getImage(imageName)
        .toPromise()
        .then(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = () => {
                this.imagesUrl[imageName] = reader.result as string;
              };
              reader.readAsDataURL(blob);
            } else {
              console.error('Error: Blob is undefined for image:', imageName);
            }
          },
          (error) => {
            console.error('Error fetching image:', error);
          }
        )
    );

    await Promise.all(fetchImagePromises);
  }

  saveImagesToLocalStorage(): void {
    if (Object.keys(this.imagesUrl).length > 0) {
      localStorage.setItem('imagesUrl', JSON.stringify(this.imagesUrl));
    }
  }

  // async generatePdf() {
  //   const doc = new jsPDF({
  //     orientation: 'portrait',
  //     unit: 'pt',
  //     format: 'a4',
  //   });

  //   const cloneTableAndRemoveColumns = (
  //     table: HTMLElement,
  //     className: string
  //   ): HTMLElement => {
  //     const clone = table.cloneNode(true) as HTMLElement;
  //     const rows = Array.from(clone.querySelectorAll('tr'));
  //     rows.forEach((row) => {
  //       const cells = Array.from(row.querySelectorAll(`.${className}`));
  //       cells.forEach((cell) => {
  //         cell.remove();
  //       });
  //     });
  //     return clone;
  //   };

  //   const processTable = async () => {
  //     const table = document.getElementById('my-table');
  //     if (!table) return;

  //     const tableClone = cloneTableAndRemoveColumns(table, 'remove');

  //     const rows = Array.from(tableClone.querySelectorAll('tr'));
  //     const images: { [key: string]: string } = {};

  //     for (const row of rows) {
  //       const cells = Array.from(row.querySelectorAll('td'));

  //       for (const cell of cells) {
  //         const img = cell.querySelector('img') as HTMLImageElement;

  //         if (img) {
  //           if (!images[img.src]) {
  //             const cachedImage = this.imageCacheService.getCachedImage(
  //               img.src
  //             );
  //             if (cachedImage) {
  //               images[img.src] = cachedImage;
  //               console.log('Image from cache:', img.src);
  //             } else {
  //               try {
  //                 images[img.src] = await this.imageCacheService.toDataURL(
  //                   img.src
  //                 );
  //                 console.log('Image cached:', img.src);
  //               } catch (error) {
  //                 console.error('Error converting image to data URL:', error);
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }

  //     console.log('Images:', images);

  //     (doc as any).autoTable({
  //       html: tableClone,
  //       startY: 10,
  //       didDrawCell: (data: { cell: any }) => {
  //         if (data.cell.raw instanceof HTMLTableCellElement) {
  //           const img = data.cell.raw.querySelector('img') as HTMLImageElement;
  //           if (img && images[img.src]) {
  //             const cellWidth = data.cell.width;
  //             const cellHeight = data.cell.height;
  //             const imgRatio = img.naturalWidth / img.naturalHeight;

  //             let imgWidth = cellWidth;
  //             let imgHeight = cellWidth / imgRatio;

  //             if (imgHeight > cellHeight) {
  //               imgHeight = cellHeight;
  //               imgWidth = cellHeight * imgRatio;
  //             }

  //             const x = data.cell.x + (cellWidth - imgWidth) / 2;
  //             const y = data.cell.y + (cellHeight - imgHeight) / 2;

  //             doc.addImage(images[img.src], 'JPEG', x, y, imgWidth, imgHeight);
  //           }
  //         }
  //       },
  //       tableWidth: 'shrink',
  //       columnStyles: {
  //         0: { cellWidth: 'auto' },
  //         1: { cellWidth: 'auto' },
  //         2: { cellWidth: 'auto' },
  //         3: { cellWidth: 'auto' },
  //         4: { cellWidth: 'auto' },
  //       },
  //       styles: {
  //         overflow: 'linebreak',
  //         cellWidth: 'wrap',
  //         minCellHeight: 60,
  //         valign: 'middle',
  //         fontSize: 10,
  //         cellPadding: 3,
  //       },
  //       headStyles: {
  //         fillColor: [255, 255, 255],
  //         textColor: [0, 0, 0],
  //         lineWidth: 0.1,
  //         lineColor: [0, 0, 0],
  //         fontSize: 10,
  //         cellPadding: 3,
  //       },
  //     });

  //     doc.save('table.pdf');
  //   };

  //   await processTable();
  // }
  async generatePdf() {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const cloneTableAndRemoveColumns = (
      table: HTMLElement,
      className: string
    ): HTMLElement => {
      const clone = table.cloneNode(true) as HTMLElement;
      const rows = Array.from(clone.querySelectorAll('tr'));
      rows.forEach((row) => {
        const cells = Array.from(row.querySelectorAll(`.${className}`));
        cells.forEach((cell) => {
          cell.remove();
        });
      });
      return clone;
    };

    const processTable = async () => {
      const table = document.getElementById('my-table');
      if (!table) return;

      const tableClone = cloneTableAndRemoveColumns(table, 'remove');

      const rows = Array.from(tableClone.querySelectorAll('tr'));
      const images: { [key: string]: string } = {};

      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td'));

        for (const cell of cells) {
          const img = cell.querySelector('img') as HTMLImageElement;

          if (img) {
            if (!images[img.src]) {
              const cachedImage = this.imageCacheService.getCachedImage(
                img.src
              );
              if (cachedImage) {
                images[img.src] = cachedImage;
                console.log('Image from cache:', img.src);
              } else {
                try {
                  images[img.src] = await this.imageCacheService.toDataURL(
                    img.src
                  );
                  console.log('Image cached:', img.src);
                } catch (error) {
                  console.error('Error converting image to data URL:', error);
                }
              }
            }
          }
        }
      }

      console.log('Images:', images);

      (doc as any).autoTable({
        html: tableClone,
        startY: 10,
        didDrawCell: (data: { cell: any }) => {
          if (data.cell.raw instanceof HTMLTableCellElement) {
            const img = data.cell.raw.querySelector('img') as HTMLImageElement;
            if (img && images[img.src]) {
              const cellWidth = data.cell.width;
              const cellHeight = data.cell.height;
              const imgRatio = img.naturalWidth / img.naturalHeight;

              let imgWidth = cellWidth;
              let imgHeight = cellWidth / imgRatio;

              if (imgHeight > cellHeight) {
                imgHeight = cellHeight;
                imgWidth = cellHeight * imgRatio;
              }

              const x = data.cell.x + (cellWidth - imgWidth) / 2;
              const y = data.cell.y + (cellHeight - imgHeight) / 2;

              doc.addImage(images[img.src], 'JPEG', x, y, imgWidth, imgHeight);
            }
          }
        },
        tableWidth: 'shrink',
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 'auto' },
        },
        styles: {
          overflow: 'linebreak',
          cellWidth: 'wrap',
          minCellHeight: 60,
          valign: 'middle',
          fontSize: 10,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          fontSize: 10,
          cellPadding: 3,
        },
      });

      doc.save('table.pdf');
    };

    await processTable();
  }

  // nextPage(): void {
  //   if (this.currentPage < this.totalPages) {
  //     this.currentPage++;
  //     this.loadDataAndGeneratePDF(this.currentPage);
  //   }
  // }

  // prevPage(): void {
  //   if (this.currentPage > 1) {
  //     this.currentPage--;
  //     this.loadDataAndGeneratePDF(this.currentPage);
  //   }
  // }
}
