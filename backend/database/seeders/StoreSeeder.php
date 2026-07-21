<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Store;

class StoreSeeder extends Seeder
{
    public function run(): void
    {
        if (Store::count() > 0) {
            $store = Store::first();
        $settings = [
            "announcement" => ["text" => "WELCOME TO INSPIREDBYNATURE — Free Shipping Nationwide", "bg_color" => "#000000", "text_color" => "#ffffff", "enabled" => true],
            "logo_text" => "INSPIREDBYNATURE",
                "logo_image" => "gemini-nano-logo.png",
                "slides" => [
                    ["id" => "1", "title" => "UNVEIL THE ESSENCE", "subtitle" => "Discover the Art of Fragrance", "image" => "banner1.jpg", "btn_text" => "EXPLORE NOW", "btn_link" => "/shop/perfumes"],
                ["id" => "2", "title" => "INSPIREDBYNATURE", "subtitle" => "EXPERIENCE CTRINE, KAWKAB AND SCENTIQUE WHITE", "image" => "banner.jpg", "btn_text" => "SHOP COLLECTION", "btn_link" => "/shop/perfumes"],
                 ],
                "categories_section" => ["enabled" => true, "title" => "Collections"],
                "featured_collections" => ["enabled" => true, "title" => "Featured collection", "tabs" => [
                    ["label" => "PERFUMES", "category" => "perfumes"],
                ]],
                "trending_products" => ["enabled" => true, "title" => "Top Trending Products", "limit" => 5],
                "whatsapp" => ["phone" => "+923173179230", "enabled" => true, "message" => "Hi, I would like to make an inquiry.", "position" => "bottom-right"],
                "installments" => ["enabled" => true, "provider" => "baadmay", "count" => 3],
                "promotional_section" => ["enabled" => true, "left_image" => "collection_bakhoor.jpg", "left_subtitle" => "Exquisite Oud", "left_title" => "Bakhoor Collection", "left_btn_text" => "Discover Now", "left_btn_link" => "/shop/bakhoor", "right_image" => "collection_perfumes.jpg", "right_subtitle" => "Signature Fragrance", "right_title" => "Luxury Perfume", "right_btn_text" => "Explore Collection", "right_btn_link" => "/shop/perfumes"],
            ];
            $store->update(['theme_settings' => json_encode($settings)]);
            echo "Store updated OK\n";
            return;
        }

        $settings = [
            "announcement" => ["text" => "WELCOME TO INSPIREDBYNATURE — Free Shipping Nationwide", "bg_color" => "#000000", "text_color" => "#ffffff", "enabled" => true],
            "logo_text" => "INSPIREDBYNATURE",
            "logo_image" => "inspiredbynature-logo.png",
            "slides" => [
                ["id" => "1", "title" => "UNVEIL THE ESSENCE", "subtitle" => "Discover the Art of Fragrance", "image" => "banner1.jpg", "btn_text" => "EXPLORE NOW", "btn_link" => "/shop/perfumes"],
                ["id" => "2", "title" => "INSPIREDBYNATURE", "subtitle" => "EXPERIENCE CTRINE, KAWKAB AND SCENTIQUE WHITE", "image" => "banner.jpg", "btn_text" => "SHOP COLLECTION", "btn_link" => "/shop/perfumes"],
             ],
            "categories_section" => ["enabled" => true, "title" => "Collections"],
            "featured_collections" => ["enabled" => true, "title" => "Featured collection", "tabs" => [
                ["label" => "PERFUMES", "category" => "perfumes"],
            ]],
            "trending_products" => ["enabled" => true, "title" => "Top Trending Products", "limit" => 5],
            "whatsapp" => ["phone" => "+923173179230", "enabled" => true, "message" => "Hi, I would like to make an inquiry.", "position" => "bottom-right"],
            "installments" => ["enabled" => true, "provider" => "baadmay", "count" => 3],
            "promotional_section" => ["enabled" => true, "left_image" => "collection_bakhoor.jpg", "left_subtitle" => "Exquisite Oud", "left_title" => "Bakhoor Collection", "left_btn_text" => "Discover Now", "left_btn_link" => "/shop/bakhoor", "right_image" => "collection_perfumes.jpg", "right_subtitle" => "Signature Fragrance", "right_title" => "Luxury Perfume", "right_btn_text" => "Explore Collection", "right_btn_link" => "/shop/perfumes"],
        ];
        Store::create([
            "StoreName" => "Inspired by Nature",
            "StoreEmail" => "info@inspiredbynature.com",
            "theme_settings" => json_encode($settings),
        ]);
        echo "Store seeded OK\n";
    }
}
