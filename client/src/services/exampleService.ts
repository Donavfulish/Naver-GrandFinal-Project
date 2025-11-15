import axios from "axios";
//import { BASE_URL } from "../config";

// Binh thuong port la 4000, 5000 hoac 5432, noi chung la tuy laptop, u can check o backend
const BASE_URL = "http://localhost:port"

export class XService {

    // Sử dụng cấu trúc try catch để tránh crash app
    static async getXBySomething(something: string): Promise<any> {
        try {
            // phan endpoint: X/:something thi minh can thong nhat voi backend de backend code dua tren endpoint do
            // Phần này chỉ đơn giản là gọi đường dẫn ở backend thôi, khoogn có xử lý thêm gì cà
            const res = await axios.get(`${BASE_URL}/X/${something}`);
            return res.data;
        } catch (err) {
            console.error("Error fetching:", err);
            throw err;
        }
    }

}

export default new XService()
