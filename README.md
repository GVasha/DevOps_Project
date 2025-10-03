# DevOps Insurance - AI-Powered Car Damage Assessment

A complete insurance company application with React.js frontend and Node.js backend, featuring AI-powered car damage assessment and secure user authentication.

## 🚀 Features

### Backend (Node.js + Express)
- **Secure Authentication**: JWT-based auth with bcrypt password hashing
- **File Upload**: Multer-based image upload with validation
- **AI Integration**: OpenAI Vision API for car damage analysis (with fallback)
- **Data Storage**: JSON file-based storage for users, assessments, and claims
- **Security**: Helmet, CORS, rate limiting, input validation
- **RESTful API**: Clean API endpoints with proper error handling

### Frontend (React.js)
- **Modern UI**: Tailwind CSS with professional design
- **Authentication**: Complete login/register system
- **Image Upload**: Drag & drop image upload with preview
- **Damage Assessment**: AI-powered analysis with detailed results
- **Claims Management**: Create and track insurance claims
- **Responsive Design**: Mobile-first, accessible interface
- **State Management**: Context API for authentication

### AI-Powered Analysis
- **Computer Vision**: Analyzes uploaded car damage photos
- **Damage Assessment**: Identifies severity, types, and affected areas
- **Cost Estimation**: Provides repair cost categories
- **Safety Alerts**: Flags potential safety concerns
- **Confidence Scoring**: Rates analysis reliability (1-10)

## 📁 Project Structure

```
DevOps Insurance/
├── backend/                 # Node.js API server
│   ├── data/               # JSON data storage
│   ├── middleware/         # Auth and validation middleware
│   ├── routes/            # API routes
│   ├── services/          # AI and external services
│   ├── uploads/           # Uploaded images
│   ├── utils/             # Helper utilities
│   └── server.js          # Main server file
├── frontend/               # React.js application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Main application pages
│   │   ├── services/      # API service layer
│   │   └── App.js         # Main app component
└── package.json           # Root package file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

### 2. Environment Configuration

Create `backend/.env` file:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development

# Optional: AI Service Configuration
OPENAI_API_KEY=your_openai_api_key_here

# File Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
```

### 3. Start the Application
```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run server    # Backend only (http://localhost:5000)
npm run client    # Frontend only (http://localhost:3000)
```

## 🔐 Security Features

### Password Security
- **bcrypt Hashing**: All passwords hashed with salt rounds (12)
- **Strong Password Policy**: Enforced complexity requirements
- **Secure Storage**: No plaintext passwords stored

### API Security
- **JWT Authentication**: Stateless token-based auth
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: All inputs validated and sanitized
- **CORS Protection**: Configured for frontend domain
- **Helmet.js**: Security headers and protection

### Data Protection
- **Environment Variables**: Sensitive data in .env files
- **File Validation**: Image uploads validated by type and size
- **Error Handling**: Secure error messages (no data leakage)

## 🤖 AI Integration

### OpenAI Vision API (Primary)
- Advanced computer vision analysis
- Detailed damage assessment
- JSON-structured results
- High accuracy and confidence scoring

### Fallback Analysis (Demo Mode)
- Basic file-based analysis when AI APIs unavailable
- Demonstrates system functionality
- Encourages proper AI API configuration

### Analysis Features
- **Damage Severity**: None, Minor, Moderate, Severe, Total Loss
- **Damage Types**: Scratches, dents, broken parts, etc.
- **Cost Categories**: Low, Medium, High, Very High
- **Affected Areas**: Front, rear, sides, roof identification
- **Safety Concerns**: Potential safety issue detection

## 📱 User Interface

### Design Principles
- **Accessibility**: WCAG compliant with proper contrast
- **Responsive**: Mobile-first design approach
- **Professional**: Clean, minimalistic insurance industry aesthetic
- **User-Friendly**: Intuitive navigation and clear feedback

### Key Pages
- **Dashboard**: Overview of assessments and claims
- **Assessment**: Photo upload and AI analysis
- **Claims**: Insurance claim creation and tracking
- **Profile**: User account management and security

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### File Upload
- `POST /api/upload/single` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images
- `GET /api/upload/file/:filename` - Get file info
- `DELETE /api/upload/file/:filename` - Delete file

### Assessment & Claims
- `POST /api/assessment/analyze` - Analyze damage
- `GET /api/assessment/my-assessments` - Get user assessments
- `GET /api/assessment/assessment/:id` - Get specific assessment
- `POST /api/assessment/create-claim` - Create insurance claim
- `GET /api/assessment/my-claims` - Get user claims
- `GET /api/assessment/claim/:id` - Get specific claim

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in environment
2. Configure production database (replace JSON files)
3. Set up proper file storage (AWS S3, etc.)
4. Configure AI API keys
5. Deploy to cloud service (AWS, Heroku, etc.)

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to static hosting (Netlify, Vercel, S3)
3. Configure API base URL for production

## 🧪 Testing

### Manual Testing
1. Register new user account
2. Upload car damage photos
3. Review AI analysis results
4. Create insurance claims
5. Test profile management

### Security Testing
- Password strength validation
- JWT token expiration
- File upload restrictions
- Rate limiting effectiveness

## 📊 Data Storage

### JSON Files (Development)
- `users.json` - User accounts and profiles
- `assessments.json` - Damage assessments and AI results
- `claims.json` - Insurance claims and status

### Production Considerations
- Replace JSON files with proper database (MongoDB, PostgreSQL)
- Implement data backup and recovery
- Add data encryption at rest
- Set up proper file storage solution

## 🔄 Future Enhancements

### Technical Improvements
- Database integration (MongoDB/PostgreSQL)
- Real-time notifications (WebSocket)
- Advanced caching (Redis)
- Microservices architecture
- Container deployment (Docker)

### Feature Additions
- Mobile app (React Native)
- Advanced reporting and analytics
- Integration with insurance APIs
- Multi-language support
- Document management system

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if port 5000 is available
- Verify .env file configuration
- Ensure all dependencies are installed

**AI analysis fails:**
- Check OpenAI API key configuration
- Verify API quota and billing
- System will fall back to basic analysis

**File upload issues:**
- Check file size limits (10MB default)
- Verify supported file types (jpg, png, gif, webp)
- Ensure uploads directory exists and is writable

**Frontend build errors:**
- Clear node_modules and reinstall
- Check React and dependency versions
- Verify Tailwind CSS configuration

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Review the troubleshooting section
- Check the API documentation

---

**DevOps Insurance** - Revolutionizing insurance claims with AI-powered damage assessment.
#   D e v O p s _ P r o j e c t  
 