import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User, Role, Skill } from '../../models/user.model';
import { RoleService } from '../../services/role.service';
import { SkillService } from '../../services/skill.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  roles: Role[] = [];
  skills: Skill[] = [];
  userForm!: FormGroup;
  selectedUser: User | null = null;
  loading = false;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private skillService: SkillService,
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadUsers();
    this.loadRoles();
    this.loadSkills();
  }

  initForm() {
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      birthdate: [null],
      picture: [''],
      description: [''],
      skills: [[]],
      roles: [[]]
    });
  }

  // Update form validation based on whether we're creating or editing a user
  updateFormValidation() {
    const passwordControl = this.userForm.get('password');
    if (passwordControl) {
      if (this.selectedUser) {
        passwordControl.setValidators(null);
      } else {
        passwordControl.setValidators([Validators.required, Validators.minLength(6)]);
      }
      passwordControl.updateValueAndValidity();
    }
  }

  loadUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users' });
        this.loading = false;
      }
    });
  }

  loadRoles() {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load roles' });
      }
    });
  }

  loadSkills() {
    this.skillService.getSkills().subscribe({
      next: (skills) => {
        this.skills = skills;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load skills' });
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please check the form for errors' });
      return;
    }

    const userData = this.userForm.value;
    this.loading = true;

    if (this.selectedUser) {
      this.updateUser(userData);
    } else {
      this.createUser(userData);
    }
  }

  createUser(userData: User) {
    this.userService.createUser(userData).subscribe({
      next: (user) => {
        this.users = [...this.users, user];
        this.filteredUsers = [...this.filteredUsers, user];
        this.resetForm();
        this.loading = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created successfully' });
      },
      error: (error) => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create user' });
      }
    });
  }

  updateUser(userData: User) {
    if (this.selectedUser && this.selectedUser.id) {
      this.userService.updateUser(this.selectedUser.id, userData).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index > -1) {
            this.users[index] = updatedUser;
            this.filteredUsers = [...this.users];
          }
          this.resetForm();
          this.loading = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully' });
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update user' });
        }
      });
    }
  }

  selectUser(user: User) {
    this.selectedUser = { ...user };
    
    this.userForm.patchValue({
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      username: user.username,
      birthdate: user.birthdate ? new Date(user.birthdate) : null,
      picture: user.picture,
      description: user.description,
      skills: user.skills || [],
      roles: user.roles || []
    });
    
    // Remove password validation when editing
    this.updateFormValidation();
  }

  clearForm() {
    this.selectedUser = null;
    this.resetForm();
  }

  resetForm() {
    this.userForm.reset();
    this.updateFormValidation();
  }

  confirmDeleteUser(user: User) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${user.name} ${user.lastname}?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteUser(user);
      }
    });
  }

  deleteUser(user: User) {
    if (user.id !== undefined) {
      this.loading = true;
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
          this.loading = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User deleted successfully' });
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user' });
        }
      });
    }
  }

  filterUsers(event: Event) {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
    
    if (!searchValue) {
      this.filteredUsers = [...this.users];
      return;
    }
    
    this.filteredUsers = this.users.filter(user => 
      user.name.toLowerCase().includes(searchValue) ||
      user.lastname.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue) ||
      user.username.toLowerCase().includes(searchValue)
    );
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }
}
