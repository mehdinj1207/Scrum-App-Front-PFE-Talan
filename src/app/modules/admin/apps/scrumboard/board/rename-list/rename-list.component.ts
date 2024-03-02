import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WorkflowItem } from 'app/modules/admin/customdash/project/classes/sprint.types';
import { ScrumboardService } from '../../scrumboard.service';


@Component({
  selector: 'app-rename-list',
  templateUrl: './rename-list.component.html',
  styleUrls: ['./rename-list.component.scss']
})
export class RenameListComponent implements OnInit {

  newName : string = ""
  idWorkflowItem:number
  workflowItem:WorkflowItem = new WorkflowItem()
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _scrumboardService: ScrumboardService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.newName=this.data.oldName;
    this.idWorkflowItem=this.data.idWorkflowItem;
  }

  stringNonAlphaNum(myString: string): boolean {
    const regex = new RegExp("[^a-zA-Z\d]");
    return regex.test(myString);
  }

  onSubmit(){
    this.workflowItem.name=this.newName
    this._scrumboardService.updateWorkflowItem(this.workflowItem,this.idWorkflowItem).subscribe(
      data=>{
        
        this._changeDetectorRef.markForCheck();
        window.location.reload()
      }
    )
  }

}
