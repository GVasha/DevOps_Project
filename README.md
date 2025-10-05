
---

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Quick Start
1. Clone the repository to the local machine, and navigate to that directory.
2.  Run `npm install` in the root directory to install all dependencies.
3. Set the **OpenAI API key** in `backend/services/aiService.js`. (The key is a necessary environment variable for AI functionality).
4. Start the development servers by running `npm run dev` from the root directory (`./DevOps_Project`).

---

## 🔐 Security Features

### Password Security
* **bcrypt Hashing**: All passwords are hashed with **12 salt rounds**.
* **Strong Password Policy**: Enforced complexity requirements during registration.
* **Secure Storage**: No plaintext passwords are ever stored.

### API Security
* **JWT Authentication**: Stateless, token-based authentication for all protected routes.
* **Rate Limiting**: Implemented to prevent brute force and denial-of-service attacks.
* **Input Validation**: All inputs are validated and sanitized to prevent injection attacks.
* **CORS Protection**: Configured specifically for the frontend domain.
* **Helmet.js**: Used to set appropriate security headers and provide protection against common web vulnerabilities.

### Data Protection
* **Environment Variables**: Sensitive configuration data is stored securely in `.env` files.
* **File Validation**: Image uploads are strictly validated by type and size.
* **Error Handling**: Secure and non-descriptive error messages are provided to prevent data leakage.

---

## 🔧 API Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/login` | User login (returns JWT) |
| `GET` | `/api/auth/profile` | Get logged-in user profile |
| `PUT` | `/api/auth/profile` | Update user profile details |

### File Upload
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/upload/single` | Upload a single image file |
| `POST` | `/api/upload/multiple` | Upload multiple image files |
| `GET` | `/api/upload/file/:filename` | Get file metadata |
| `DELETE` | `/api/upload/file/:filename` | Delete a file |

### Assessment & Claims (Protected)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/assessment/analyze` | Submit images for AI damage analysis |
| `GET` | `/api/assessment/my-assessments` | Get all damage assessments for the user |
| `GET` | `/api/assessment/assessment/:id` | Get details for a specific assessment |
| `POST` | `/api/assessment/create-claim` | Submit an insurance claim based on an assessment |
| `GET` | `/api/assessment/my-claims` | Get all insurance claims for the user |
| `GET` | `/api/assessment/claim/:id` | Get details for a specific claim |

---

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in the production environment.
2. Configure a production database (replace the development JSON files).
3. Set up proper file storage for uploads (e.g., **AWS S3**).
4. Configure all necessary AI API keys in the production environment.
5. Deploy the server to a cloud service (e.g., **AWS**, **Heroku**).

### Frontend Deployment
1. Build the production bundle using `npm run build`.
2. Deploy the generated static files to a static hosting service (**Netlify**, **Vercel**, **S3**).
3. Configure the **API base URL** to point to the deployed backend server.

---

## 📊 Data Storage

### JSON Files (Development)
The development environment uses simple JSON files for rapid prototyping:
* `users.json` - User accounts and profiles
* `assessments.json` - Damage assessments and AI results
* `claims.json` - Insurance claims and status

### Production Considerations
* **Database**: Replace JSON files with a proper, scalable database (**MongoDB** or **PostgreSQL** are recommended).
* **Data Backup**: Implement a robust data backup and recovery strategy.
* **Encryption**: Add data encryption at rest for sensitive information.
* **File Storage**: Implement a secure, scalable file storage solution (as noted in Deployment).

---

## 🔄 Future Enhancements

The current application is a strong foundation for future improvements.

### Common Troubleshooting

| Issue | Potential Solution |
| :--- | :--- |
| **Backend won't start** | Check if port **5000** is available. Verify `.env` file configuration. Ensure all dependencies are installed. |
| **AI analysis fails** | Check **OpenAI API key** configuration. Verify API quota and billing status. *(System will fall back to basic analysis)*. |
| **File upload issues** | Check the file size limits (**10MB default**). Verify supported file types (**jpg, png, gif, webp**). Ensure the `uploads` directory exists and is writable. |
| **Frontend build errors** | Clear `node_modules` and reinstall dependencies. Check React and dependency versions. Verify **Tailwind CSS** configuration. |

---

**DevOps Insurance** - Revolutionizing insurance claims with AI-powered damage assessment.
