## ADDED Requirements

### Requirement: Profile Data Management

The system SHALL allow members to view and edit their own profile data: chinese_name, english_name, line_name, specialty_title, specialty_description, general_referral, ideal_referral, dream_referral. Officers SHALL be able to edit any member's profile.

#### Scenario: Member edits own profile

- **WHEN** a member updates their specialty_description via the profile page
- **THEN** the system SHALL save the change to the `members` table and display a success confirmation

#### Scenario: Officer edits another member's profile

- **WHEN** an officer updates a member's specialty_title via the admin member detail page
- **THEN** the system SHALL save the change and log the modification timestamp

---

### Requirement: Photo Upload

The system SHALL allow members to upload a profile photo. The photo SHALL be stored in Supabase Storage at `members/{member_id}/photo`. The system SHALL accept JPEG and PNG formats up to 5MB. The uploaded photo SHALL be displayed on the member's profile page and on their weekly presentation slide.

#### Scenario: Member uploads a valid photo

- **WHEN** a member uploads a 2MB JPEG file as their profile photo
- **THEN** the system SHALL store the file at `members/{member_id}/photo`, update `members.photo_url`, and display the new photo immediately

#### Scenario: Member uploads an oversized file

- **WHEN** a member attempts to upload a 10MB photo
- **THEN** the system SHALL reject the upload and display "檔案大小不可超過 5MB"

---

### Requirement: Product Image Gallery

The system SHALL allow members to upload up to 10 product images. Images SHALL be stored at `members/{member_id}/products/{filename}`. These images SHALL be available for use in weekly presentation slides and keynote talk slides.

#### Scenario: Member uploads product images

- **WHEN** a member uploads 3 product images
- **THEN** the system SHALL store all 3 files and display them in a gallery grid on the member's profile page

---

### Requirement: Profile Visibility

All member profiles SHALL be viewable by any authenticated member within the chapter. Profile pages SHALL display: photo, name, specialty, expertise description, and three-tier referral targets.

#### Scenario: Member views another member's profile

- **WHEN** a member navigates to another member's profile page
- **THEN** the system SHALL display that member's full profile information in read-only mode
