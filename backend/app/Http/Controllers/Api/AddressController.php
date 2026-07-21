<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;

class AddressController extends Controller
{
    public function index()
    {
        $userId = auth()->id();
        return Address::where('user_id', $userId)->get();
    }
}
