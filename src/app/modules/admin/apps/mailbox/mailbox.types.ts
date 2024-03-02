
import { User } from "../../customdash/user/User"; 
import { Project } from "../../customdash/project/classes/project.types";

export interface Mail
{
    id?: string;
    type?: string;
    from?: {
        avatar?: string;
        contact?: string;
    };
    to?: string;
    cc?: string[];
    ccCount?: number;
    bcc?: string[];
    bccCount?: number;
    date?: string;
    subject?: string;
    content?: string;
    attachments?: {
        type?: string;
        name?: string;
        size?: number;
        preview?: string;
        downloadUrl?: string;
    }[];
    starred?: boolean;
    important?: boolean;
    unread?: boolean;
    folder?: string;
    labels?: string[];
}

export interface MailCategory
{
    type: 'folder' | 'filter' | 'label';
    name: string;
}

export interface MailFolder
{
    id: string;
    title: string;
    slug: string;
    icon: string;
    count?: number;
}

export interface MailFilter
{
    id: string;
    title: string;
    slug: string;
    icon: string;
}

export interface MailLabel
{
    id: string;
    title: string;
    slug: string;
    color: string;
}
export class Feedback{
    idFeedback:number;
    content:string;
    star:number;
    isRead:boolean;
    isImportant:boolean;
    dateFeedback:Date;
    dateEditFeedback:Date;
    project:Project;
    user: User;
    urgent:boolean;
    sendOrReceived:boolean;//if it is sent 0 else 1
    replyOnFeedback:Feedback;
}
export class FeedbackReceivers{
    idFeedbackReceivers: number;
    feedback:Feedback;
    user: User;
    read:boolean;
    important:boolean;
}
interface SliderData {
    val: number;
  }
