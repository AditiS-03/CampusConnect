# ⚡ CampusConnect

**CampusConnect** is a premium, mission-driven platform designed to streamline the relationship between **Campus Ambassadors** and **Organization Admins**. It simplifies task management, submission verification, and real-time communication in a sleek, high-performance interface.

---

Here's the link to the video prototype: https://drive.google.com/file/d/1J6aayp1HHS49rznc4g2rYRkTS7r7xeaG/view?usp=sharing

## 🌟 Key Features

### 👥 For Campus Ambassadors
*   **Mission Board**: Discover and participate in missions curated by your organization.
*   **Submission Tracking**: Submit proof of work and track your approval status in real-time.
*   **Query Bot**: A direct messaging platform to clarify doubts with your program manager.
*   **Personalized Profile**: A sleek dashboard showcasing your missions and organization affiliation.

### 🛡️ For Organization Admins
*   **Program Overview**: Real-time analytics on student engagement and task performance.
*   **Ambassador Directory**: Manage your team of ambassadors, view their documents, and track their progress.
*   **Verification Hub**: A centralized system to review, approve, or reject student submissions.
*   **Task Management**: Create and distribute missions tailored to your program's goals.
*   **Command Centre Messaging**: Two-way messaging with all your ambassadors.

---

## 🚀 Tech Stack

*   **Frontend**: React (Vite)
*   **Styling**: Vanilla CSS (Modern Design System with Dark Mode/Glassmorphism)
*   **Backend**: Supabase (PostgreSQL, Auth, Real-time)
*   **Icons/Avatars**: DiceBear & Lucide-style iconography

---

## 🛠️ Getting Started

### 1. Prerequisites
*   Node.js (v16+)
*   NPM

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-repo/CampusConnect.git

# Navigate to the project
cd CampusConnect

# Install dependencies
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Run the SQL schema provided in `SUPABASE_SETUP.sql` within your Supabase SQL Editor to initialize the tables (`users`, `tasks`, `submissions`, `messages`).

### 5. Launch
```bash
npm run dev
```
The app will be available at `http://localhost:5174`.

---

## 🎨 Design Philosophy
CampusConnect follows a **Premium Dark Aesthetic**, utilizing:
*   Harmonious HSL-tailored color palettes.
*   Smooth CSS transitions and micro-animations.
*   Glassmorphic UI components for a state-of-the-art feel.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.