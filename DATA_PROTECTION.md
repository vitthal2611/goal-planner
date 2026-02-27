# Data Protection System

## 🛡️ Zero Data Loss Guarantee

This system ensures NO data loss during development, testing, or production.

## Protection Layers

### 1. **Automatic Backups**
- Auto-backup every 5 minutes
- Firebase + LocalStorage dual backup
- Keeps last 10 backups locally
- Unlimited cloud backups

### 2. **Safe Write Operations**
- Read → Backup → Write → Verify
- Automatic rollback on failure
- Snapshot before every write

### 3. **Offline Queue**
- Queues operations when offline
- Auto-sync when online
- No data loss during network issues

### 4. **Development Guards**
- Warns when modifying real user data
- Test user prefix: `test_`
- Confirmation dialogs in dev mode

### 5. **Data Integrity Checks**
- Validates data structure
- Detects corruption
- Serialization verification

### 6. **Migration Safety**
- Dry-run mode (default)
- Automatic backups before migration
- Rollback capability

## Usage

### Add to App Component
```jsx
import { BackupManager } from './components/BackupManager';
import { useDataProtection } from './hooks/useDataProtection';

function App() {
  const { checkIntegrity } = useDataProtection(userId, repository);
  
  useEffect(() => {
    checkIntegrity();
  }, []);

  return (
    <>
      <BackupManager userId={userId} repository={repository} />
      {/* Your app */}
    </>
  );
}
```

### Safe Migration
```javascript
import { FirebaseMigration } from './utils/firebaseMigration';

const migration = new FirebaseMigration();

// 1. DRY RUN (no changes)
await migration.migrateUserData(userId, true);

// 2. Review output, then LIVE
await migration.migrateUserData(userId, false);
```

### Development Testing
```javascript
// Use test users
const testUserId = 'test_john_doe';

// System will NOT warn for test users
// System WILL warn for real users in dev mode
```

### Manual Backup/Restore
```javascript
const { createBackup, restoreBackup, listBackups } = useDataProtection(userId, repository);

// Create backup
await createBackup();

// List backups
const backups = await listBackups();

// Restore
await restoreBackup(timestamp);
```

## Recovery Scenarios

### Scenario 1: Accidental Delete
- Restore from automatic backup (last 5 min)
- Or restore from any previous backup

### Scenario 2: Migration Failed
- Automatic backup exists before migration
- Use rollback function
- Or restore from backup timestamp

### Scenario 3: Offline Changes
- Changes queued automatically
- Synced when online
- No manual intervention needed

### Scenario 4: Data Corruption
- Run integrity check
- Restore from last healthy backup
- System validates on restore

## Backup Locations

1. **Firebase**: `backups/{userId}/{timestamp}`
2. **LocalStorage**: `backups` key (last 10)
3. **Migration Snapshots**: `users/{userId}/backup_{timestamp}`
4. **Write Snapshots**: `snapshots/{userId}/{timestamp}`

## Best Practices

✅ Always use test users (test_*) for development
✅ Run dry-run migration first
✅ Check integrity after major changes
✅ Keep BackupManager visible during development
✅ Monitor offline queue size
✅ Clean old snapshots weekly

❌ Never disable dev guards in development
❌ Never skip dry-run migrations
❌ Never ignore integrity warnings
