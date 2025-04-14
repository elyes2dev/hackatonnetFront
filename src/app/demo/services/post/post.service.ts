import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from 'src/app/demo/models/post';
import { Comment } from 'src/app/demo/models/comment';
import { map } from 'rxjs/operators';  // Add this import
import { PageResponse } from 'src/app/demo/models/post';

@Injectable({
  providedIn: 'root'
})
export class PostService {


  private apiUrl = 'http://localhost:9100/pi';

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`this.apiUrl/posts`);
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/posts/${id}`);
  }

  createPost(formData: FormData): Observable<Post> {
    return this.http.post<Post>(this.apiUrl, formData);
  }

  createComment(postId: number, comment: Comment): Observable<Comment> {
    const commentRequest = {
      userId: comment.userId,
      content: comment.content
    };
    return this.http.post<Comment>(
      `http://localhost:9100/pi/comments/post/${postId}`,
      commentRequest
    );
  }
  
  likePost(postId: number, userId: number): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/posts/${postId}/like/${userId}`, {});
  }
  
  getPostsByHackathon(hackathonId: number): Observable<Post[]> {
    return this.http.get<any>(`${this.apiUrl}/posts/hackathon/${hackathonId}?size=100`)
      .pipe(
        map(response => {
          // Extract the content array from the paginated response
          const posts = response.content || [];
          console.log('Raw posts data:', posts);
          return posts.map((post: any) => ({
            ...post,
            postedBy: post.postedBy || { 
              id: 0, 
              name: 'Unknown', 
              lastname: '', 
              picture: 'assets/default-avatar.png' 
            },
            hackathon: post.hackathon || { 
              id: 0, 
              title: 'No Hackathon' 
            },
            likes: post.likes || [],
            comments: post.comments || []
          }));
        })
      );
  }
  
  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/comments/${commentId}`);
  }


} 