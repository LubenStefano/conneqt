export interface Post {
    _id: string;
    content: string;
    img?: string;
    creator: string;
    date: Date;
    likes: string[];
    comments: string[];
}