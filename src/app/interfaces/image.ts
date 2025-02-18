export interface Image {
    id_img: number;
    name_img: string;
    url_img: string;
}
  
export interface ImageResponse {
    error: boolean;
    status: number;
    body: Image[];
}
  