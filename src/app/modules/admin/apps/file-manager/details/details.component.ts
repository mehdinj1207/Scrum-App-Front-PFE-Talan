import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FileManagerListComponent } from 'app/modules/admin/apps/file-manager/list/list.component';
import { FileManagerService } from 'app/modules/admin/apps/file-manager/file-manager.service';
import { Item } from 'app/modules/admin/apps/file-manager/file-manager.types';
import { Attachment } from '../Attachment';
import { saveAs } from 'file-saver';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';

@Component({
    selector: 'file-manager-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileManagerDetailsComponent implements OnInit, OnDestroy {
    item: Item;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    attachment: Attachment = new Attachment();
    idFile: string = localStorage.getItem('idFile')

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fileManagerListComponent: FileManagerListComponent,
        private _fileManagerService: FileManagerService,
        private fileManagerService: FileManagerService,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._fileManagerListComponent.matDrawer.open();

        // Get the item
        /*this._fileManagerService.item$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((item: Item) => {

                // Open the drawer in case it is closed
                this._fileManagerListComponent.matDrawer.open();

                // Get the item
                this.item = item;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });*/

        // Get the file 
        this.fileManagerService.getFile(this.idFile).subscribe(
            data => {

                this.attachment = data;
                this._changeDetectorRef.markForCheck();
                this.attachment.fileSize = Number((this.attachment.fileSize / (1024 * 1024)).toFixed(3));
            }
        )


    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._fileManagerListComponent.matDrawer.close();

    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    deleteFile() {


        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete file',
            message: 'Are you sure you want to delete this file? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if (result === 'confirmed') {

                // Delete the file
                this._router.navigate(['../../'], { relativeTo: this._activatedRoute }).then(() => {
                    window.location.reload();
                });
                this._fileManagerListComponent.matDrawer.opened = false;
                this._fileManagerListComponent.matDrawer.close();
                this._changeDetectorRef.markForCheck()
                this.fileManagerService.deleteFile(this.idFile).subscribe(
                    data => {
                        this._changeDetectorRef.markForCheck();
                    }
                )

            }
        });





    }

    downloadFile() {

        this.fileManagerService.downloadFile(this.idFile).subscribe(
            data => {
                saveAs(data, this.attachment.fileName)
                this._changeDetectorRef.markForCheck();
            }
        )
    }


}
