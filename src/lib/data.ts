
import { User, Post } from "./types";

// Mock user data
export const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    bio: "Software engineer passionate about web development",
    followers: 1200,
    following: 450,
  },
  {
    id: "2",
    name: "Jane Smith",
    username: "janesmith",
    email: "jane@example.com",
    avatar: "https://i.pravatar.cc/150?img=2",
    bio: "UX/UI Designer | Creating beautiful interfaces",
    followers: 3500,
    following: 320,
  },
  {
    id: "3",
    name: "Alex Johnson",
    username: "alexj",
    email: "alex@example.com",
    avatar: "https://i.pravatar.cc/150?img=3",
    bio: "Tech enthusiast and photographer",
    followers: 2100,
    following: 550,
  },
];

// Mock post data
export const posts: Post[] = [
  {
    id: "1",
    userId: "1",
    userName: "John Doe",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    content: "Just launched my new website! Check it out and let me know what you think. #webdev #coding",
    image: "https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=500&auto=format&fit=crop",
    likes: 120,
    isLiked: false,
    comments: [
      {
        id: "c1",
        postId: "1",
        userId: "2",
        userName: "Jane Smith",
        userAvatar: "https://i.pravatar.cc/150?img=2",
        content: "Looks amazing! Great work!",
        createdAt: "2023-04-05T14:30:00Z",
      },
      {
        id: "c2",
        postId: "1",
        userId: "3",
        userName: "Alex Johnson",
        userAvatar: "https://i.pravatar.cc/150?img=3",
        content: "The design is fantastic. Would love to hear more about the tech stack you used.",
        createdAt: "2023-04-05T15:45:00Z",
      },
    ],
    createdAt: "2023-04-05T12:00:00Z",
  },
  {
    id: "2",
    userId: "2",
    userName: "Jane Smith",
    userAvatar: "https://i.pravatar.cc/150?img=2",
    content: "Here's my latest UI design for a fitness app. What do you think of the color scheme? #design #UI",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop",
    likes: 87,
    isLiked: true,
    comments: [
      {
        id: "c3",
        postId: "2",
        userId: "1",
        userName: "John Doe",
        userAvatar: "https://i.pravatar.cc/150?img=1",
        content: "Love the colors! Very modern and sleek.",
        createdAt: "2023-04-06T10:15:00Z",
      },
    ],
    createdAt: "2023-04-06T09:30:00Z",
  },
  {
    id: "3",
    userId: "3",
    userName: "Alex Johnson",
    userAvatar: "https://i.pravatar.cc/150?img=3",
    content: "Just hiked Mount Rainier! The views were absolutely breathtaking. #hiking #nature #adventure",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop",
    likes: 215,
    isLiked: false,
    comments: [
      {
        id: "c4",
        postId: "3",
        userId: "2",
        userName: "Jane Smith",
        userAvatar: "https://i.pravatar.cc/150?img=2",
        content: "So jealous! That view is incredible!",
        createdAt: "2023-04-07T18:22:00Z",
      },
      {
        id: "c5",
        postId: "3",
        userId: "1",
        userName: "John Doe",
        userAvatar: "https://i.pravatar.cc/150?img=1",
        content: "How long did the hike take? I've been wanting to try that trail.",
        createdAt: "2023-04-07T19:05:00Z",
      },
    ],
    createdAt: "2023-04-07T16:45:00Z",
  },
];
