<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function index()
    {
        return Store::all()->map(function ($store) {
            return $this->sanitize($store);
        });
    }

    public function show(Store $store)
    {
        return $this->sanitize($store);
    }

    public function update(Request $request, Store $store)
    {
        $store->update($request->all());
        return $store;
    }

    public function store(Request $request)
    {
        $store = Store::first();
        if ($store) {
            $store->update($request->all());
            return $store;
        }
        return Store::create($request->all());
    }

    private function sanitize(Store $store): Store
    {
        $store->makeHidden([
            'fb_access_token',
            'fb_ad_account',
            'fb_business_manager',
            'fb_pixel_id',
            'fb_page',
            'fb_data_sharing',
        ]);
        return $store;
    }
}
