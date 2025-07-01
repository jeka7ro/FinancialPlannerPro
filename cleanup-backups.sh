#!/bin/bash

# CASHPOT ERP - Backup Cleanup Script
# Removes old backup directories and files to free up space

set -e

echo "🧹 CASHPOT ERP Backup Cleanup Tool"
echo "=================================="

# Check if backups directory exists
if [ ! -d "backups" ]; then
    echo "❌ No backups directory found"
    exit 0
fi

cd backups

# Get current project size
CURRENT_SIZE=$(du -sh .. | cut -f1)
echo "📊 Current project size: $CURRENT_SIZE"

# Find all backup directories and files
BACKUP_DIRS=($(ls -1 | grep "CASHPOT_BACKUP.*[^.tar.gz]$" | sort 2>/dev/null || true))
BACKUP_TARS=($(ls -1 | grep "CASHPOT_BACKUP.*\.tar\.gz$" | sort 2>/dev/null || true))

if [ ${#BACKUP_DIRS[@]} -eq 0 ] && [ ${#BACKUP_TARS[@]} -eq 0 ]; then
    echo "✅ No backup files found to clean up"
    exit 0
fi

echo ""
echo "🔍 Found backup directories:"
for dir in "${BACKUP_DIRS[@]}"; do
    if [ -d "$dir" ]; then
    size=$(du -sh "$dir" | cut -f1)
    echo "   📁 $dir ($size)"
    fi
done

echo ""
echo "🔍 Found backup archives:"
for tar in "${BACKUP_TARS[@]}"; do
    if [ -f "$tar" ]; then
    size=$(du -sh "$tar" | cut -f1)
    echo "   📦 $tar ($size)"
    fi
done

# Get the most recent backup
LATEST_DIR=$(ls -1 | grep "CASHPOT_BACKUP.*[^.tar.gz]$" | sort | tail -1 2>/dev/null || true)
LATEST_TAR=$(ls -1 | grep "CASHPOT_BACKUP.*\.tar\.gz$" | sort | tail -1 2>/dev/null || true)

echo ""
echo "✅ Will keep (most recent):"
if [ -n "$LATEST_DIR" ]; then
echo "   📁 $LATEST_DIR"
fi
if [ -n "$LATEST_TAR" ]; then
echo "   📦 $LATEST_TAR"
fi

echo ""
echo "🗑️  Will remove (older backups):"

# Calculate space to be freed
SPACE_TO_FREE=0

# List directories to remove
for dir in "${BACKUP_DIRS[@]}"; do
    if [ "$dir" != "$LATEST_DIR" ]; then
        size=$(du -sb "$dir" | cut -f1)
        SPACE_TO_FREE=$((SPACE_TO_FREE + size))
        echo "   📁 $dir ($(du -sh "$dir" | cut -f1))"
    fi
done

# List archives to remove  
for tar in "${BACKUP_TARS[@]}"; do
    if [ "$tar" != "$LATEST_TAR" ]; then
        size=$(du -sb "$tar" | cut -f1)
        SPACE_TO_FREE=$((SPACE_TO_FREE + size))
        echo "   📦 $tar ($(du -sh "$tar" | cut -f1))"
    fi
done

# Convert bytes to human readable
SPACE_TO_FREE_HR=$(echo $SPACE_TO_FREE | awk '{
    if ($1 >= 1073741824) {
        printf "%.1fGB", $1/1073741824
    } else if ($1 >= 1048576) {
        printf "%.1fMB", $1/1048576
    } else if ($1 >= 1024) {
        printf "%.1fKB", $1/1024
    } else {
        printf "%dB", $1
    }
}')

echo ""
echo "💾 Space to be freed: $SPACE_TO_FREE_HR"
echo ""

# Confirmation
read -p "⚠️  Proceed with cleanup? This action cannot be undone! (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🧹 Starting cleanup..."

# Remove old directories
for dir in "${BACKUP_DIRS[@]}"; do
    if [ "$dir" != "$LATEST_DIR" ]; then
        echo "   🗑️  Removing directory: $dir"
        rm -rf "$dir"
    fi
done

# Remove old archives
for tar in "${BACKUP_TARS[@]}"; do
    if [ "$tar" != "$LATEST_TAR" ]; then
        echo "   🗑️  Removing archive: $tar"
        rm -f "$tar"
    fi
done

# Also remove any old database backup files in root
if [ -f "backup_20250628_004500_database.sql" ]; then
    echo "   🗑️  Removing old database backup: backup_20250628_004500_database.sql"
    rm -f "backup_20250628_004500_database.sql"
fi

echo ""
echo "✅ Cleanup completed!"

# Show new size
NEW_SIZE=$(du -sh .. | cut -f1)
echo "📊 New project size: $NEW_SIZE"
echo "💾 Space freed: $SPACE_TO_FREE_HR"

echo ""
echo "🎉 Your project is now optimized!"
echo "💡 Future backups will be stored in the backups/ directory."
echo "📝 Backup script updated to exclude: --exclude='backups'" 