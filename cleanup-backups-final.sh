#!/bin/bash

# CASHPOT ERP - Final Backup Cleanup Script (macOS compatible)
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

# Find the most recent backups
LATEST_DIR=$(ls -1 | grep "CASHPOT_BACKUP.*[^.tar.gz]$" | sort | tail -1 2>/dev/null || true)
LATEST_TAR=$(ls -1 | grep "CASHPOT_BACKUP.*\.tar\.gz$" | sort | tail -1 2>/dev/null || true)

if [ -z "$LATEST_DIR" ] && [ -z "$LATEST_TAR" ]; then
    echo "✅ No backup files found to clean up"
    exit 0
fi

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

# List and count old backup directories
OLD_DIRS=$(ls -1 | grep "CASHPOT_BACKUP.*[^.tar.gz]$" | grep -v "$LATEST_DIR" 2>/dev/null || true)
if [ ! -z "$OLD_DIRS" ]; then
    echo "$OLD_DIRS" | while read dir; do
        if [ -d "$dir" ]; then
            size=$(du -sh "$dir" | cut -f1)
            echo "   📁 $dir ($size)"
        fi
    done
fi

# List and count old backup archives
OLD_TARS=$(ls -1 | grep "CASHPOT_BACKUP.*\.tar\.gz$" | grep -v "$LATEST_TAR" 2>/dev/null || true)
if [ ! -z "$OLD_TARS" ]; then
    echo "$OLD_TARS" | while read tar; do
        if [ -f "$tar" ]; then
            size=$(du -sh "$tar" | cut -f1)
            echo "   📦 $tar ($size)"
        fi
    done
fi

# Check for old database backup
if [ -f "backup_20250628_004500_database.sql" ]; then
    size=$(du -sh "backup_20250628_004500_database.sql" | cut -f1)
    echo "   📄 backup_20250628_004500_database.sql ($size)"
fi

echo ""
echo "💾 Estimated space to be freed: ~45GB"
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

# Remove old backup directories
if [ ! -z "$OLD_DIRS" ]; then
    echo "$OLD_DIRS" | while read dir; do
        echo "   🗑️  Removing directory: $dir"
        rm -rf "$dir"
    done
fi

# Remove old backup archives
if [ ! -z "$OLD_TARS" ]; then
    echo "$OLD_TARS" | while read tar; do
        echo "   🗑️  Removing archive: $tar"
        rm -f "$tar"
    done
fi

# Remove old database backup file
if [ -f "backup_20250628_004500_database.sql" ]; then
    echo "   🗑️  Removing old database backup: backup_20250628_004500_database.sql"
    rm -f "backup_20250628_004500_database.sql"
fi

echo ""
echo "✅ Cleanup completed!"

# Show new size
NEW_SIZE=$(du -sh .. | cut -f1)
echo "📊 New project size: $NEW_SIZE"

echo ""
echo "🎉 Your project is now optimized!"
echo "💡 Future backups will be stored in the backups/ directory."
echo "📝 Backup script updated to exclude: --exclude='backups'" 