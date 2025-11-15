import { useQuery } from "@tanstack/react-query";

// Với mỗi nhóm hook thì sẽ có nhóm service tương ứng
// Vai trò của hook là để định nghĩa cách thức request trên fe tới được với be
// Hook này chia thành 2 phần với ý nghĩa là tách 2 phần xử lý dữ liệu và phần call api ra riêng
// Service sẽ đóng vai trò call api
// Hook đóng vai trò lưu data fetch được vào cache và truyền lại cho UI
// Vậy nên khi m viết 1 hook, cần xác định nó thuộc nhóm nào (nhóm x) -> viết xHook và xService (bên service t có để sample)
import { XService } from "@/services/exampleService";

class XHook {

    // Ví dụ viết hàm fetch data của một X factor, và truyền vào param something -> tên hàm là useXBySomething, nếu không xài param gì thì useX thôi
    static useXBySomething(something: string) {
        return useQuery({
            // Key ở cache, cache giống như 1 object mapping, với mỗi key có value là data của key đó
            queryKey: ["x_by_something", something],
            
            // Call hàm bên service
            queryFn: async () => {
                return await XService.getXBySomething(something);
            },

            // Điều kiện thực hiện hook (không xài param gì thì khỏi cần)
            enabled: !!something,

            // Thời gian sống của cache
            staleTime: 1000 * 60 * 10,
        });
    }
}

export default XHook
