import { SafeUrl } from "@angular/platform-browser";

export class User {
    idUser: number;
    avatar: string;
    cin: String;
    firstname: string;
    lastname: String;
    position: String;
    role: String;
    active: Boolean;
    email: string;
    tel: string;
    status: Boolean;
    data: Blob;
    color: string;
    department: Department;
    country: Country;
}

export class Department {
    idDepartment: number;
    name: string;
    color: string
} 

export interface UsersPagination {
  
    size: number;
    page: number;
}
export class Country
{
    idCountry: string;
    iso: string;
    name: string;
    code: string;
    flagImagePos: string;
}



