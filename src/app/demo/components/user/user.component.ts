import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { RoleService } from '../../services/role.service';
import { SkillService } from '../../services/skill.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  newUser: User = this.initializeUser();
  selectedUser: User | null = null;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private skillService: SkillService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  initializeUser(): User {
    return { name: '', lastname: '', email: '', username: '', password: '', birthdate: null, picture: '', description: '',badge: 'JUNIOR_COACH' };
  }

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  createUser() {
    this.userService.createUser(this.newUser).subscribe(user => {
      this.users.push(user);
      this.newUser = this.initializeUser();
    });
  }

  updateUser() {
    if (this.selectedUser && this.selectedUser.id) {
      this.userService.updateUser(this.selectedUser.id, this.newUser).subscribe(updatedUser => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index > -1) {
          this.users[index] = updatedUser;
        }
        this.clearSelection();
      });
    }
  }

  clearSelection() {
    this.selectedUser = null;
  }

  deleteUser(userId: number) {
    if (userId !== undefined) {
      this.userService.deleteUser(userId).subscribe(() => {
        this.users = this.users.filter(user => user.id !== userId);
      });
    }
  }

  selectUser(user: User) {
    this.selectedUser = { ...user };
  }
}
