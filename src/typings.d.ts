interface Product {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  popularity: number;
  stock: number;
  originalPrice?: number;
  colors?: string[];
  sizes?: string[];
  additional_images?: string[];
}

interface ProductInCart extends Product {
  id: string;
  productId?: string;
  quantity: number;
  size: string;
  color: string;
  stock: number;
}

interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: string;
  password: string;
}

interface Order {
  id: number;
  orderStatus: string;
  orderDate: string;
  data: {
    email: string;
  };
  products: ProductInCart[];
  subtotal: number;
  user: {
    email: string;
    id: number;
  };
}
