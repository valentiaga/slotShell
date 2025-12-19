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
  
export interface CloudinaryImage {
  id_img?: number;
  name_img: string;
  url_img: string;
  public_id: string;
  created_at?: string;
  is_new?: boolean;
}