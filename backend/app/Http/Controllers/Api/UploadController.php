<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpg,jpeg,png,gif,webp|max:20480',
        ]);

        $file = $request->file('file');
        if (!$file->isValid() || !$this->isValidImage($file->getPathname())) {
            return response()->json(['error' => 'Invalid image file.'], 422);
        }

        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        
        $uploadDir = public_path('assets/uploads');
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }
        $file->move($uploadDir, $filename);

        return response()->json([
            'filename' => 'uploads/' . $filename,
            'url' => '/assets/uploads/' . $filename,
        ]);
    }

    private function isValidImage(string $path): bool
    {
        $magicBytes = file_get_contents($path, false, null, 0, 12);
        $signatures = [
            "\xFF\xD8\xFF" => 'jpeg',
            "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A" => 'png',
            "\x47\x49\x46\x38\x37\x61" => 'gif',
            "\x47\x49\x46\x38\x39\x61" => 'gif',
            "\x52\x49\x46\x46" => 'webp',
        ];

        foreach ($signatures as $sig => $type) {
            if (str_starts_with($magicBytes, $sig)) {
                return true;
            }
        }
        return false;
    }
}
