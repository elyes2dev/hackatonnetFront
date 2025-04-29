import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User, Role, Skill } from '../../models/user.model';
import { RoleService } from '../../services/role.service';
import { SkillService } from '../../services/skill.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { FileUploadService } from '../../services/file-upload.service';

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
    private confirmationService: ConfirmationService,
    private fileUploadService: FileUploadService
  ) {}

  errorMessage: string | null = null;
  selectedProfilePicture: File | null = null;
  profilePicturePreview: string | null = null;
  isSubmitting = false;
  uploadProgress = 0;
  token: any;

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

    this.isSubmitting = true;
    this.loading = true;

    if (this.selectedProfilePicture) {
      // Upload the profile picture first, then create/update user
      this.uploadProfilePicture();
    } else {
      // No new profile picture, proceed with user creation/update
      const userData = this.userForm.value;
      if (this.selectedUser) {
        this.updateUser(userData);
      } else {
        this.createUser(userData);
      }
    }
  }

  createUser(userData: User) {
    this.userService.createUser(userData).subscribe({
      next: (user) => {
        this.users = [...this.users, user];
        this.filteredUsers = [...this.filteredUsers, user];
        this.resetForm();
        this.loading = false;
        this.isSubmitting = false;
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User created successfully' });
      },
      error: (error) => {
        this.loading = false;
        this.isSubmitting = false;
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
          this.isSubmitting = false;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'User updated successfully' });
        },
        error: (error) => {
          this.loading = false;
          this.isSubmitting = false;
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

    // Set profile picture preview if available
    if (user.picture) {
      this.profilePicturePreview = user.picture;
    } else {
      this.profilePicturePreview = null;
    }
    
    // Remove password validation when editing
    this.updateFormValidation();
  }

  clearForm() {
    this.selectedUser = null;
    this.resetForm();
  }

  resetForm() {
    this.userForm.reset();
    this.selectedProfilePicture = null;
    this.profilePicturePreview = null;
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

  onProfilePictureSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!this.isValidImageType(file)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File',
          detail: 'Please select a valid image file (JPEG, PNG, GIF)'
        });
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'File Too Large',
          detail: 'Profile picture file size should not exceed 2MB'
        });
        return;
      }
      
      this.selectedProfilePicture = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicturePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    return validTypes.includes(file.type);
  }

  removeProfilePicture(): void {
    this.selectedProfilePicture = null;
    this.profilePicturePreview = null;
    this.userForm.patchValue({ picture: '' });
  }

  uploadProfilePicture(): void {
    if (!this.selectedProfilePicture) {
      // No picture to upload, proceed with the rest of the form submission
      const userData = this.userForm.value;
      if (this.selectedUser) {
        this.updateUser(userData);
      } else {
        this.createUser(userData);
      }
      return;
    }

    this.fileUploadService.uploadFile(this.selectedProfilePicture, 'logo')
      .pipe(
        finalize(() => {
          // Reset progress when complete regardless of outcome
          this.uploadProgress = 0;
        })
      )
      .subscribe({
        next: (event: HttpEvent<any>) => {
          // Track upload progress
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          }
          
          // Handle the response
          if (event instanceof HttpResponse) {
            if (event.body && event.body.filePath) {
              // Use the file path returned from the server
              const userData = this.userForm.value;
              userData.picture = this.fileUploadService.getFileUrl(event.body.filePath);
              
              // Now proceed with user creation/update
              if (this.selectedUser) {
                this.updateUser(userData);
              } else {
                this.createUser(userData);
              }
            } else {
              this.handleUploadError('Invalid response from server');
            }
          }
        },
        error: (error) => {
          this.handleUploadError('Failed to upload profile picture');
          console.error('Error uploading file:', error);
        }
      });
  }

  private handleUploadError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: message
    });
    this.isSubmitting = false;
    this.loading = false;
  }
}