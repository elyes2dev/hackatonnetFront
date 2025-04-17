import { Component, OnInit } from '@angular/core';
import { UserService } from '../demo/services/user.service';
import { AuthService } from '../demo/services/auth.service';
import { StorageService } from '../demo/services/storage.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user: any;
  profileImageUrl: string | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    const userId = this.storageService.getLoggedInUserId();
    this.userService.getUserById(userId).subscribe(user => {
      this.user = user;
      
    });
  }
}