# **Conneqt**  

🚀 **Live Demo**: [Conneqt - Hosted on GitHub Pages](https://lubenstefano.github.io/conneqt/home)  

## **Table of Contents**  
1. [Introduction](#introduction)  
2. [Features](#features)  
3. [Technologies Used](#technologies-used)  
4. [Setup and Installation](#setup-and-installation)  
5. [Usage](#usage)  
6. [Database Structure](#database-structure)  
7. [Development Workflow](#development-workflow)  


---

## **Introduction**  
**Conneqt** is a modern, scalable social networking platform built with Angular and Firebase. Inspired by platforms like Twitter, it allows users to interact with content, save posts, and engage in a connected online environment. Conneqt emphasizes speed, responsiveness, and user-centric design, offering a seamless experience across devices.  

---

## **Features**  
- **User Authentication**:  
  Powered by Firebase Authentication, enabling secure sign-ups, logins, and profile management.  
- **Post Saving**:  
  Users can save posts to their profiles for quick access.  
- **Real-Time Data**:  
  Firebase's real-time database ensures that users receive live updates across the platform.  
- **Image Cropper**:  
  Integrated image cropping tool for profile picture uploads and more.  
- **Responsive Design**:  
  Optimized for desktop and mobile.  
- **Loaders**:  
  Enhanced user feedback during data processing and server requests.  

---

## **Technologies Used**  
- **Frontend**:  
  - Angular (Typescript, HTML, CSS)  
  - RxJS for reactive programming  
- **Backend and Database**:  
  - Firebase Authentication  
  - Firebase Firestore/Cloud storage
- **Hosting**:  
  - GitHub Pages  

---

## **Setup and Installation**  

### **Prerequisites**  
1. Install [Node.js](https://nodejs.org/) (v14+ recommended).  
2. Install [Angular CLI](https://angular.io/cli):  
   ```bash  
   npm install -g @angular/cli  
   ```  

### **Steps to Clone and Run**  
1. Clone the repository:  
   ```bash  
   git clone https://github.com/your-username/conneqt.git  
   ```  

2. Navigate to the project directory:  
   ```bash  
   cd conneqt  
   ```  

3. Install dependencies:  
   ```bash  
   npm install  
   ```  

4. Run the application locally:  
   ```bash  
   ng serve  
   ```  
   The app will be available at `http://localhost:4200`.  


---

## **Usage**  

### **Homepage**  
The homepage features trending posts, a search bar, and user-specific recommendations.  

### **Profile Management**  
Authenticated users can update their profile picture using the image cropper and customize other personal details.  

### **Saving Posts**  
Click the "Save" button on posts to add them to your saved posts list, accessible via the profile page.  

---

## **Database Structure**  

### **Users Collection**  
```json  
{  
  "users": {  
    "userId": {  
      "username": "exampleUser",  
      "photoUrl": "http://example.com/photo.jpg",  
      "savedPosts": ["postId1", "postId2"]  
    }  
  }  
}  
```  

### **Posts Collection**  
```json  
{  
  "posts": {  
    "postId": {  
      "content": "This is a sample post.",  
      "authorId": "userId",  
      "savedBy": ["userId1", "userId2"]  
    }  
  }  
}  
```  

---

## **Deploy in github pages**  
```
ng build --output-path=dist --base-href="/conneqt/"
ngh --dir=dist
ngh --dir=dist/browser

```

---


### **Code Organization**  
- **App Component**:  
  Root-level layout and conditional rendering based on screen size (desktop/mobile).  
- **Services**:  
  Shared logic for API calls, data management, and authentication.  

### **Key Practices**  
- Using Angular CLI for efficient module and component generation.  
- Employing media queries in CSS for responsive design.  
- Database indexing for performance optimization.  

---
