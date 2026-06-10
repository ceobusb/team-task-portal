# Team Task Portal

React, Node.js, Express, PostgreSQL ve Prisma kullanılarak geliştirilen ekip içi proje ve görev yönetim portalı.

## Proje Amacı

Bu proje; ekiplerin proje oluşturma, görev ekleme, görev atama, durum takibi ve rol bazlı yetkilendirme işlemlerini yönetebilmesi için geliştirilmiştir.

Amaç sadece bir CRUD yapmak değil; gerçek projelerde kullanılan backend yapısını, yetkilendirme mantığını, görev akışını ve ileride eklenecek gerçek zamanlı sistemleri öğrenmektir.

## Kullanılan Teknolojiler

### Backend
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT
- bcryptjs
- CORS
- dotenv

### Frontend
- React
- Vite
- CSS
- İlerleyen aşamada drag-drop, dashboard ve socket yapısı

## Özellikler

- Kullanıcı kayıt olma
- Kullanıcı giriş yapma
- JWT ile kimlik doğrulama
- Rol bazlı yetkilendirme
- Manager ve Member rol yapısı
- Proje oluşturma
- Proje listeleme
- Proje güncelleme
- Proje silme
- Görev oluşturma
- Görev listeleme
- Görev güncelleme
- Görev silme
- Görev durumunu değiştirme
- Sadece yetkili kullanıcıların işlem yapabilmesi

## Rol Yapısı

### MANAGER
- Proje oluşturabilir
- Proje güncelleyebilir
- Proje silebilir
- Görev oluşturabilir
- Görev güncelleyebilir
- Görev silebilir
- Tüm görevlerin durumunu değiştirebilir

### MEMBER
- Sadece kendisine atanmış görevlerin durumunu değiştirebilir
- Yönetim işlemleri yapamaz

## API Yapısı

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`

### Projects
- `POST /api/projects`
- `GET /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

### Tasks
- `POST /api/tasks`
- `GET /api/tasks`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `DELETE /api/tasks/:id`

## Veritabanı Modelleri

### User
- id
- name
- email
- password
- role
- createdAt

### Project
- id
- title
- description
- ownerId
- createdAt
- updatedAt

### Task
- id
- title
- description
- status
- priority
- dueDate
- projectId
- assignedUserId
- createdAt
- updatedAt

## Kurulum

### 1. Backend
```bash
cd backend
npm install
