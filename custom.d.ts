// images.d.ts

// 1. Khai báo module cho tệp PNG
// Điều này cho TypeScript biết rằng bất kỳ import nào kết thúc bằng '.png'
// nên được coi là một module mà giá trị export mặc định của nó là 'string'.
// Trong môi trường Webpack/Vite/Bundler, giá trị này chính là đường dẫn URL của ảnh.
declare module '*.png' {
  const value: string;
  export default value;
}

// 2. (Tùy chọn) Khai báo cho các định dạng ảnh khác nếu bạn dùng
declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  
  // Nếu bạn đang dùng React và muốn import SVG như một Component:
  // export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  
  // Nếu chỉ muốn import dưới dạng đường dẫn:
  const value: string;
  export default value;
}