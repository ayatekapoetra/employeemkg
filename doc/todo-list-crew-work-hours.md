# TODO List - Fitur Monitoring Kinerja Crew Mining

## Phase 1: Backend Development

### Database Design
- [x] Create single table `ops_crew_workhours` with all fields:
  - [x] Basic fields: id, crew_id, tanggal, jam_mulai, jam_selesai, istirahat_mulai, istirahat_selesai
  - [x] Detail fields: spv_id, keterangan
  - [x] Calculated fields: total_jam_kerja, total_jam_istirahat, jam_kerja_produkf
  - [x] Overtime fields: jam_kerja_normal (default 8.00), jam_lembur (calculated only for status='A')
  - [x] Approval fields: spv_id (nullable), status (enum 'P','A','R'), approval_at, komentar_spv
  - [x] Timestamps: created_at, updated_at
  - [x] Foreign keys to karyawan table
  - [x] Performance indexes: crew_tanggal, status, approval_date

### API Implementation - Crew Endpoints
- [ ] **POST /api/crew-work-hours** - Create new work hour record
  - [ ] Validate crew can only create for themselves
  - [ ] Set default status = 'P'
  - [ ] Calculate and store work hours
  - [ ] Validate time inputs (start < end, break reasonable)
  - [ ] Return created record with calculated fields
- [ ] **PUT /api/crew-work-hours/{id}** - Update work hour record
  - [ ] Check if status = 'P' (only pending can be edited)
  - [ ] Validate crew can only edit their own records
  - [ ] Recalculate work hours
  - [ ] Update timestamp
  - [ ] Return updated record
- [ ] **DELETE /api/crew-work-hours/{id}** - Delete work hour record
  - [ ] Check if status = 'P'
  - [ ] Validate crew can only delete their own records
  - [ ] Cascade delete related records if any
- [ ] **GET /api/crew-work-hours/my-records** - Get crew's own work hours
  - [ ] Pagination support (page, limit)
  - [ ] Filter by status (P, A, R)
  - [ ] Filter by date range
  - [ ] Sort by created_at (newest first)
- [ ] **GET /api/crew-work-hours/{id}** - Get work hour detail
  - [ ] Include crew details, supervisor details (if any)
  - [ ] Include approval history
  - [ ] Include lembur calculation if status = 'A'

### API Implementation - Supervisor Endpoints
- [ ] **GET /api/crew-work-hours/pending** - Get pending approvals
  - [ ] Pagination support
  - [ ] Filter by date, crew, supervisor
  - [ ] Include crew basic info
- [ ] **PUT /api/crew-work-hours/{id}/approve** - Approve work hour
  - [ ] Check if current user is supervisor
  - [ ] Check if current status = 'P'
  - [ ] Update status = 'A', spv_id = current user id, approval_at = NOW()
  - [ ] Set komentar_spv if provided
  - [ ] jam_lembur will be automatically calculated
  - [ ] Send notification to crew
- [ ] **PUT /api/crew-work-hours/{id}/reject** - Reject work hour
  - [ ] Check if current user is supervisor
  - [ ] Check if current status = 'P'
  - [ ] Update status = 'R', spv_id = current user id, approval_at = NOW()
  - [ ] Set komentar_spv (required for rejection)
  - [ ] jam_lembur remains 0 for rejected records
  - [ ] Send notification to crew
- [ ] **PUT /api/crew-work-hours/{id}/cancel-approval** - Cancel approval
  - [ ] Check if current user is supervisor or admin
  - [ ] Check if current status = 'A' or 'R'
  - [ ] Update status = 'P', spv_id = NULL, approval_at = NULL
  - [ ] Clear komentar_spv
  - [ ] jam_lembur automatically recalculated to 0
- [ ] **GET /api/crew-work-hours/approved** - Get approved records
  - [ ] Pagination support
  - [ ] Filter by date range, crew, supervisor
  - [ ] Include lembur information

### API Implementation - Report Endpoints
- [ ] **GET /api/reports/crew-work-hours** - Get work hours report
  - [ ] Date range filter (start_date, end_date)
  - [ ] Filter by crew_id, status, spv_id
  - [ ] Pagination and sorting
  - [ ] Summary statistics (total records, total hours, etc.)
- [ ] **GET /api/reports/crew-lembur** - Get lembur report
  - [ ] Only include status = 'A' records
  - [ ] Monthly filter (year, month)
  - [ ] Group by crew with total lembur hours
  - [ ] Export to CSV/Excel support
- [ ] **GET /api/reports/summary** - Get summary report
  - [ ] Date range filter
  - [ ] Total crew, total hours, total lembur hours
  - [ ] Average working hours, average lembur hours
  - [ ] Top performers, highest lembur

### Business Logic Implementation
- [ ] **Work Hours Calculator**
  - [ ] Calculate total_jam_kerja (jam_selesai - jam_mulai) - handled by database
  - [ ] Calculate total_jam_istirahat (istirahat_selesai - istirahat_mulai) - handled by database
  - [ ] Calculate jam_kerja_produkf (total_jam_kerja - total_jam_istirahat) - handled by database
  - [ ] Validate time logic (start < end, break within work hours)
- [ ] **Status Management**
  - [ ] Flow: Pending → Approved/Rejected
  - [ ] Prevent edit/delete for non-pending status
  - [ ] Automatic status change on approval/rejection
- [ ] **Overtime Calculator**
  - [ ] jam_lembur automatically calculated by database (only for status='A')
  - [ ] No need to create/update separate lembur records
  - [ ] jam_lembur = 0 when status is not 'A'
- [ ] **Validation Rules**
  - [ ] No overlap work schedules for same crew
  - [ ] Minimum break time validation (1 hour)
  - [ ] Maximum work hours validation (e.g., 16 hours)
  - [ ] Future date prevention (except today)
- [ ] **Notification System**
  - [ ] Email/push notification on approval
  - [ ] Email/push notification on rejection
  - [ ] Notification template management

### Authentication & Authorization
- [ ] **Role Definitions**
  - [ ] Crew: Can create/edit/delete own pending records
  - [ ] Supervisor: Can approve/reject/cancel approval
  - [ ] HR/Admin: Can view reports, manage all records
- [ ] **Middleware Implementation**
  - [ ] auth.middleware - Check authentication
  - [ ] crew.middleware - Check if user is crew
  - [ ] supervisor.middleware - Check if user is supervisor
  - [ ] owner.middleware - Check if user owns the record
- [ ] **Permission Matrix**
  - [ ] Create table for permissions
  - [ ] Role-permission mapping
  - [ ] Dynamic permission checking

## Phase 2: Frontend Development

### Core Components - Crew
- [ ] **CrewWorkHoursForm**
  - [ ] Date picker for tanggal
  - [ ] Time pickers for jam_mulai, jam_selesai, istirahat_mulai, istirahat_selesai
  - [ ] Dropdown for spv_id
  - [ ] Text area for keterangan with character counter
  - [ ] Real-time calculation preview
  - [ ] Form validation with error messages
  - [ ] Submit button with loading state
- [ ] **MyWorkHoursList**
  - [ ] Tabbed interface for different statuses (P, A, R)
  - [ ] Cards/List items showing work hour details
  - [ ] Status badges with colors (P=yellow, A=green, R=red)
  - [ ] Swipeable actions (edit/delete for pending)
  - [ ] Pull-to-refresh functionality
  - [ ] Infinite scroll with pagination
- [ ] **WorkHourDetail**
  - [ ] Display all work hour information
  - [ ] Approval status indicator
  - [ ] Lembur calculation display (if approved)
  - [ ] Supervisor comment display (if rejected)
  - [ ] Action buttons (edit for pending)
- [ ] **ActivityNarrativeInput**
  - [ ] Rich text area for keterangan
  - [ ] Character/word counter
  - [ ] Placeholder examples
  - [ ] Validation for minimum length

### Core Components - Supervisor
- [ ] **ApprovalDashboard**
  - [ ] Statistics cards (pending count, approved today, etc.)
  - [ ] Filter bar (date, crew, supervisor)
  - [ ] List of pending approvals
  - [ ] Quick actions (approve all, bulk actions)
  - [ ] Search functionality
- [ ] **ApprovalDetail**
  - [ ] Complete work hour information display
  - [ ] Crew information card
  - [ ] Validation checks (overlap, reasonable times)
  - [ ] Comment input for rejection
  - [ ] Approve/Reject buttons with confirmation
- [ ] **ApprovalActions**
  - [ ] Modal for approval with comment
  - [ ] Confirmation dialog for reject
  - [ ] Success/error notifications
  - [ ] Loading states during action
- [ ] **ApprovedRecordsList**
  - [ ] Similar to MyWorkHoursList but for supervisor
  - [ ] Export functionality
  - [ ] Filter by approval date range
  - [ ] Bulk actions (export selected)

### Shared Components
- [ ] **DateTimePicker**
  - [ ] Custom time picker with 15-minute intervals
  - [ ] Date picker with disabled dates
  - [ ] Validation for time ranges
  - [ ] Dark/light mode support
- [ ] **WorkHoursCalculator**
  - [ ] Real-time calculation display
  - [ ] Visual representation (timeline/bar)
  - [ ] Break time highlight
  - [ ] Overtime calculation preview
- [ ] **NotificationAlert**
  - [ ] Toast notifications for approval status
  - [ ] Push notification handler
  - [ ] Notification history
  - [ ] Mark as read functionality
- [ ] **StatusIndicator**
  - [ ] Badge component for status
  - [ ] Progress indicator for approval flow
  - [ ] Timeline component for approval history
- [ ] **FilterComponents**
  - [ ] Date range picker
  - [ ] Multi-select dropdown
  - [ ] Search input with debounce
  - [ ] Active filter tags

### Pages/Routes - Crew
- [ ] **/crew-work-hours/my**
  - [ ] Main page with tab navigation
  - [ ] Floating action button for create
  - [ ] Stats summary at top
  - [ ] List of work hours with filters
- [ ] **/crew-work-hours/create**
  - [ ] Form page with header
  - [ ] Back navigation
  - [ ] Auto-save draft functionality
  - [ ] Form validation
- [ ] **/crew-work-hours/{id}/edit**
  - [ ] Similar to create but pre-filled
  - [ ] Only for pending status
  - ] Show original values

### Pages/Routes - Supervisor
- [ ] **/crew-work-hours/approvals**
  - [ ] Dashboard page with pending list
  - [ ] Statistics and quick filters
  - [ ] Search and filter functionality
- [ ] **/crew-work-hours/approvals/{id}**
  - [ ] Detail approval page
  - [ ] Full work hour information
  - [ ] Approval actions with comments
- [ ] **/crew-work-hours/approved**
  - [ ] List of approved records
  - [ ] Export functionality
  - [ ] Advanced filtering

### Pages/Routes - Reports
- [ ] **/reports/crew-hours**
  - [ ] Report dashboard with charts
  - [ ] Date range selector
  - [ ] Filter options
  - [ ] Export buttons (PDF, Excel)
- [ ] **/reports/crew-lembur**
  - [ ] Lembur summary table
  - [ ] Monthly/weekly view
  - [ ] Crew breakdown
  - [ ] Export for payroll

### UI/UX Implementation
- [ ] **Theme Integration**
  - [ ] Support for dark/light mode
  - [ ] Consistent color scheme
  - [ ] Proper spacing and typography
- [ ] **Responsive Design**
  - [ ] Mobile-first approach
  - [ ] Tablet and desktop breakpoints
  - [ ] Adaptive layouts
- [ ] **Loading States**
  - [ ] Skeleton loaders
  - [ ] Progress indicators
  - [ ] Optimistic UI updates
- [ ] **Error Handling**
  - [ ] Error boundaries
  - [ ] User-friendly error messages
  - [ ] Retry functionality
- [ ] **Animations**
  - [ ] Page transitions
  - [ ] Button feedback
  - [ ] Status change animations

## Phase 3: Testing & Deployment

### Unit Testing
- [ ] **Backend Tests**
  - [ ] API endpoint tests (jest)
  - [ ] Business logic tests
  - [ ] Database operation tests
  - [ ] Validation rule tests
- [ ] **Frontend Tests**
  - [ ] Component unit tests (jest + react-testing-library)
  - [ ] Component integration tests
  - [ ] Hook tests
  - [ ] Form validation tests
- [ ] **E2E Tests**
  - [ ] Critical user flows (detox)
  - [ ] Approval flow testing
  - [ ] Cross-device testing

### Integration Testing
- [ ] **API Integration**
  - [ ] Mock API responses
  - [ ] Error scenario testing
  - [ ] Performance testing
- [ ] **Database Integration**
  - [ ] Seed data management
  - [ ] Migration testing
  - [ ] Relationship testing
- [ ] **User Flow Testing**
  - [ ] Complete crew workflow
  - [ ] Complete supervisor workflow
  - [ ] Report generation testing

### User Acceptance Testing
- [ ] **Alpha Testing**
  - [ ] Internal team testing
  - [ ] Bug tracking and fixing
  - [ ] Performance optimization
- [ ] **Beta Testing**
  - [ ] Select users testing
  - [ ] Feedback collection
  - [ ] Usability improvements
- [ ] **Production Testing**
  - [ ] UAT with actual users
  - [ ] Final bug fixes
  - [ ] Performance validation

### Deployment
- [ ] **Backend Deployment**
  - [ ] Database migration scripts
  - [ ] API deployment to production
  - [ ] Environment configuration
  - [ ] Monitoring setup
- [ ] **Frontend Deployment**
  - [ ] Build optimization
  - [ ] App store submission
  - [ ] Rollout strategy
  - [ ] Crash reporting setup
- [ ] **Documentation**
  - [ ] API documentation (swagger)
  - [ ] User manual (crew)
  - [ ] User manual (supervisor)
  - [ ] Technical documentation
- [ ] **Monitoring**
  - [ ] Error tracking (sentry)
  - [ ] Performance monitoring
  - [ ] Usage analytics
  - [ ] Health checks

## Success Criteria

- [ ] All Phase 1 items completed
- [ ] 90% test coverage
- [ ] Performance: < 3s load time for 1000 records
- [ ] User satisfaction: > 4/5 rating
- [ ] Zero critical bugs in production