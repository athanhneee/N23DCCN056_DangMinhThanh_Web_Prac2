# Microservices Shop

Sinh vien thuc hien: Dang Minh Thanh  
MSSV: N23DCCN056

## Gioi thieu
Day la do an microservices shop gom 4 service chinh:

- `api-gateway`: dieu huong request va xac thuc JWT giua cac service
- `product-service`: quan ly san pham, CRUD va upload anh len Cloudinary
- `order-service`: quan ly don hang va cap nhat trang thai don hang
- `auth-service`: dang ky, dang nhap, refresh token va lay thong tin nguoi dung

He thong su dung:

- `PostgreSQL` cho `product-service` va `auth-service`
- `MongoDB` cho `order-service`
- `Redis` de cache du lieu local
- `Docker Compose` de chay dong bo toan bo he thong

## Tinh nang noi bat
- Tach he thong theo kien truc microservices
- Gateway xu ly dinh tuyen request giua cac service
- Xac thuc bang JWT
- CRUD san pham day du
- Upload anh san pham len Cloudinary
- Quan ly don hang va cap nhat trang thai don hang
- Redis cache cho `GET /api/products` va tu dong lam moi khi du lieu thay doi
- Docker Compose tich hop san PostgreSQL, MongoDB, Redis de phuc vu chay local

## Huong dan chay project local
1. Clone project
   ```bash
   git clone <link-repo-github>
   cd microservices-shop
   ```
2. Chay bang Docker Compose
   ```bash
   docker compose up --build
   ```
3. Truy cap cac service
   - API Gateway: `http://localhost:3000`
   - Product Service: `http://localhost:3001`
   - Order Service: `http://localhost:3002`
   - Auth Service: `http://localhost:3003`

## Cac endpoint chinh
### Product Service
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/products/:id/image`

### Order Service
- `POST /api/orders`
- `GET /api/orders/customer/:customerId`
- `PATCH /api/orders/:id/status`

### Auth Service
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

## Swagger
- Product Service: `http://localhost:3001/api-docs`
- Order Service: `http://localhost:3002/api-docs`
- Auth Service: `http://localhost:3003/api-docs`

## Link deploy
Nen tang su dung: Render

- Product Service: `https://n23dccn056-dangminhthanh-web-prac2-1.onrender.com`
- Order Service: `https://n23dccn056-dangminhthanh-web-prac2.onrender.com`

## Ket qua kiem thu
- CRUD product, order, auth va gateway chay thanh cong o local
- Upload anh san pham len Cloudinary hoat dong dung
- Redis cache hoat dong voi `GET /api/products`, tu dong lam moi sau khi du lieu thay doi
- Product Service va Order Service deploy Render hoat dong on dinh

## Cau truc thu muc
```bash
microservices-shop/
|-- api-gateway/
|-- auth-service/
|-- order-service/
|-- product-service/
|-- docker-compose.yml
`-- README.md
```
