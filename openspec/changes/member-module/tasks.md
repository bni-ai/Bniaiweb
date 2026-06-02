## 1. Admin member operations

- [ ] [P] Implement member profile CRUD per **d1 — admin members list page** and **d2 — member profile form fields** in design.md so officers can create, filter, edit, and toggle active members for the current chapter; verify by running the member-profile-crud scenarios for create, edit, toggle, and filter flows in the admin members routes.
- [ ] [P] Add server actions for member profile CRUD and member self-service protections per **d2 — member profile form fields** in design.md so required fields are enforced on create and restricted fields stay read-only for members; verify by executing action-level tests or manual submissions that prove member profile CRUD and role protection behavior.

## 2. Member self-service profiles

- [ ] [P] Deliver GAINS profile editing per **d3 — gains profile** in design.md so a member can auto-save goals, accomplishments, interests, networks, and skills with retry feedback; verify by exercising the gains-profile save and failure scenarios on `/dashboard/gains`.
- [ ] [P] Deliver member top clients per **d5 — top clients (10名客戶)** in design.md so ranks 1 through 10 remain unique and visibly available; verify by exercising the member-top-clients create, update, and placeholder scenarios on `/dashboard/top-clients`.
- [ ] [P] Deliver member contacts circle per **d6 — contacts circle (人脈圈)** in design.md so members can add, edit, and remove tiered contacts without collapsing other tiers; verify by exercising the member-contacts-circle add, update, and delete scenarios on `/dashboard/contacts-circle`.

## 3. One-on-one scheduling

- [ ] Implement one-on-one form availability management per **d4 — one-on-one form** in design.md so members can store weekly availability windows and review them from the dashboard; verify by exercising the one-on-one-form availability scenario and confirming persisted `member_availability` rows.
- [ ] Implement one-on-one form booking and status updates per **d4 — one-on-one form** in design.md so valid bookings create a Jitsi room, invalid overlaps are rejected, and participants can confirm, complete, or cancel a booking; verify by exercising the one-on-one-form booking, conflict, and status scenarios against the booking action and dashboard UI.
