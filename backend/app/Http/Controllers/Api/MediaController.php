<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class MediaController extends Controller
{
    public function index()
    {
        $media = [];

        // Read default assets from root (non-uploads)
        $this->scanDir(public_path('assets'), '', $media);

        // Read user-uploaded assets from uploads/ subdirectory
        $this->scanDir(public_path('assets/uploads'), 'uploads/', $media);

        // Sort by time descending (newest first)
        usort($media, function ($a, $b) {
            return $b['time'] <=> $a['time'];
        });

        return response()->json($media);
    }

    private function scanDir($dir, $prefix, &$media)
    {
        if (!is_dir($dir)) return;
        $files = File::files($dir);
        foreach ($files as $file) {
            $extension = strtolower($file->getExtension());
            if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])) {
                $media[] = [
                    'id' => md5($prefix . $file->getFilename()),
                    'name' => $prefix . $file->getFilename(),
                    'url' => '/assets/' . $prefix . $file->getFilename(),
                    'size' => $this->formatBytes($file->getSize()),
                    'time' => $file->getMTime(),
                ];
            }
        }
    }

    public function destroy($filename)
    {
        // Only allow deleting files from the uploads/ subdirectory
        if (!str_starts_with($filename, 'uploads/')) {
            return response()->json(['message' => 'System assets cannot be deleted.'], 403);
        }

        // Sanitize: keep uploads/ prefix but strip any path traversal
        $relativePath = 'uploads/' . basename(substr($filename, 8));
        if (!preg_match('/^uploads\/[a-zA-Z0-9._-]+$/', $relativePath)) {
            return response()->json(['message' => 'Invalid filename.'], 400);
        }

        $backendFile = public_path('assets/' . $relativePath);

        if (File::exists($backendFile)) {
            File::delete($backendFile);
            return response()->json(['status' => 'success', 'message' => 'File deleted successfully.']);
        }

        return response()->json(['message' => 'File not found.'], 404);
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
