export class UserData {
    public static jwt: string = localStorage.getItem('user_token') || "[]";
    
}