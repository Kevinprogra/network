import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  name: string;
  avatar: string;
  role?: string;
}

interface Comment {
  id: number;
  user: User;
  text: string;
}

interface Post {
  id: number;
  user: User;
  content: string;
  image?: string | ArrayBuffer | null;
  likes: number;
  liked: boolean;
  comments: Comment[];
  showComments?: boolean;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {

  //  Usuario actual  conectar con jhon
  currentUser: User = {
    id: 1,
    name: 'Kevin Marin',
    avatar: 'https://i.pravatar.cc/150?img=3'
  };

  //  Crear post
  newPost: string = '';
  selectedImage: string | ArrayBuffer | null = null;

  // Lista de publicaciones tipo mock
  posts: Post[] = [
    {
      id: 1,
      user: {
        id: 2,
        name: 'memo',
        avatar: 'https://i.pravatar.cc/150?img=5',
        role: 'Profesor'
      },
      content: 'Recuerden que el examen es el próximo martes en el Aula 402.',
      likes: 24,
      liked: false,
      comments: [],
    }
  ];

  // Crear publicación
  createPost() {
    if (!this.newPost.trim()) return;

    this.posts.unshift({
      id: Date.now(),
      user: this.currentUser,
      content: this.newPost,
      image: this.selectedImage,
      likes: 0,
      liked: false,
      comments: []
    });

    this.newPost = '';
    this.selectedImage = null;
  }

  // me gusta
  toggleLike(post: Post) {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;

    if (post.liked) {
      this.notify(post.user.name, 'le dio like a tu publicación');
    }
  }

  //  Comentario
  addComment(post: Post, text: string) {
    if (!text.trim()) return;

    post.comments.push({
      id: Date.now(),
      user: this.currentUser,
      text
    });

    this.notify(post.user.name, 'comentó tu publicación');
  }

  //  imagen
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;


    const reader = new FileReader();
    reader.onload = () => {
      this.selectedImage = reader.result;
    };
    reader.readAsDataURL(file);
  }

  
  notify(user: string, action: string) {
    console.log(`🔔 ${user} ${action}`);
  }
}