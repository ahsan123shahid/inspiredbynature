<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\User;
use App\Models\Order;
use App\Models\Category;
use App\Models\SubCategory;
use App\Models\CatItem;
use App\Models\AdminLogin;
use App\Models\Role;
use App\Models\CPage;
use App\Models\Notification;
use App\Models\Store;
use App\Models\Tax;
use App\Models\Emarket;
use App\Models\Collection;
use App\Models\NavItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Products from db.json
        $products = [
            ['title' => 'Dulook', 'image' => 'product_dulook.jpg', 'category' => 'perfumes', 'price' => 26000, 'popularity' => 10, 'stock' => 0],
            ['title' => 'The Beyond 2050', 'image' => 'product_beyond_2050.jpg', 'category' => 'perfumes', 'price' => 36000, 'popularity' => 9, 'stock' => 0],
            ['title' => 'The Alchemy Lab 2025', 'image' => 'product_alchemy_lab.jpg', 'category' => 'perfumes', 'price' => 36000, 'popularity' => 8, 'stock' => 10],
            ['title' => 'Bloom Spectrum', 'image' => 'product_bloom_spectrum.jpg', 'category' => 'perfumes', 'price' => 6500, 'popularity' => 7, 'stock' => 0],
            ['title' => 'Ctrine', 'image' => 'product_ctrine.jpg', 'category' => 'perfumes', 'price' => 8000, 'popularity' => 6, 'stock' => 5],
            ['title' => 'Garnet', 'image' => 'product_garnet.jpg', 'category' => 'perfumes', 'price' => 12000, 'popularity' => 5, 'stock' => 15],
            ['title' => 'Opaline Wave', 'image' => 'product_opaline_wave.jpg', 'category' => 'perfumes', 'price' => 15000, 'popularity' => 4, 'stock' => 0],
            ['title' => 'Kaaf Pink', 'image' => 'product_kaaf_pink.jpg', 'category' => 'perfumes', 'price' => 11000, 'popularity' => 3, 'stock' => 8],
            ['title' => 'Prometheus', 'image' => 'product_prometheus.jpg', 'category' => 'perfumes', 'price' => 18000, 'popularity' => 2, 'stock' => 0],
            ['title' => 'Dubai Chocolate', 'image' => 'product_dubai_chocolate.jpg', 'category' => 'perfumes', 'price' => 9500, 'popularity' => 1, 'stock' => 12],
        ];
        foreach ($products as $p) {
            Product::create($p);
        }

        // Users from db.json (with hashed passwords)
        $users = [
            ['name' => 'Aleksandar', 'lastname' => 'Kuzmanovic', 'email' => 'aleksandarkuzmanovic021@gmail.com', 'password' => Hash::make('1233214321'), 'role' => 'customer'],
            ['name' => 'Bojan', 'lastname' => 'Cesnak', 'email' => 'bc22@gmail.com', 'password' => Hash::make('123321'), 'role' => 'customer'],
            ['name' => 'A', 'lastname' => 'A', 'email' => 'a@gmail.com', 'password' => Hash::make('123321'), 'role' => 'customer'],
            ['name' => 'Lebron', 'lastname' => 'James', 'email' => 'lebronjames@gmail.com', 'password' => Hash::make('1233214321'), 'role' => 'customer'],
            ['name' => 'Admin', 'lastname' => 'User', 'email' => 'admin@admin.com', 'password' => Hash::make('admin123'), 'role' => 'admin'],
        ];
        foreach ($users as $u) {
            User::create($u);
        }

        // Orders from db.json
        $orderData = [];
        foreach ($orderData as $o) {
            Order::create($o);
        }

        // Categories from zappos.sql
        Category::create(['cat_title' => 'PERFUMES', 'cat_img' => 'collection_perfumes.jpg']);
        Category::create(['cat_title' => 'BAKHOOR', 'cat_img' => 'collection_bakhoor.jpg']);
        Category::create(['cat_title' => 'OILS', 'cat_img' => 'collection_oils.jpg']);
        Category::create(['cat_title' => 'GIFT SETS', 'cat_img' => 'collection_giftsets.jpg']);

        // SubCategories from zappos.sql
        SubCategory::create(['subcat_title' => 'Floral', 'subcat_img' => '1.jpg', 'cat_id' => 1, 'handle' => 'floral', 'SEOdescription' => 'Floral', 'SEOtitle' => 'Floral']);
        SubCategory::create(['subcat_title' => 'Woody', 'subcat_img' => '1.jpg', 'cat_id' => 1, 'handle' => 'woody', 'SEOdescription' => 'Woody', 'SEOtitle' => 'Woody']);
        SubCategory::create(['subcat_title' => 'Oud', 'subcat_img' => '1.jpg', 'cat_id' => 2, 'handle' => 'oud', 'SEOdescription' => 'Oud', 'SEOtitle' => 'Oud']);

        // CatItems from zappos.sql
        CatItem::create(['cat_item_title' => 'Eau de Parfum', 'cat_item_img' => 'Image 1.png', 'subcat_id' => 1, 'SEOdescription' => 'Eau de Parfum', 'SEOtitle' => 'Eau de Parfum', 'handle' => 'eau-de-parfum']);

        // Roles from zappos.sql
        Role::create(['name' => 'admin']);
        Role::create(['name' => 'moderator']);
        Role::create(['name' => 'user']);

        // AdminLogin from zappos.sql (admin user with all permissions)
        AdminLogin::create([
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin123'),
            'f_name' => 'Admin',
            'l_name' => 'User',
            'OrderPage' => 1,
            'ProductPage' => 1,
            'OrderDetailsPage' => 1,
            'AddProductPage' => 1,
            'UpdateProductPage' => 1,
            'CategoryPage' => 1,
            'AddCategoryPage' => 1,
            'UpdateCategoryPage' => 1,
            'CustomerPage' => 1,
            'AboutCustomerPage' => 1,
            'SubcategoryPage' => 1,
            'AddSubcategoryPage' => 1,
            'UpdateSubcategoryPage' => 1,
            'CollectionPage' => 1,
            'AddCollectionPage' => 1,
            'UpdateCollectionPage' => 1,
            'SettingsPage' => 1,
            'GeneralPage' => 1,
            'StaffAccountPage' => 1,
            'StaffAreaPage' => 1,
            'UpdateStaffAreaPage' => 1,
            'TaxPage' => 1,
            'PaymentPage' => 1,
            'NotificationPage' => 1,
            'TranslationPage' => 1,
        ]);

        // CMS Pages from zappos.sql
        CPage::create(['title' => 'Contact Us', 'description' => 'Contact us', 'SEOtitle' => 'Contact Us', 'SEOdescription' => 'Contact Us', 'SEOurl' => 'Contact Us', 'visibility' => 1]);
        CPage::create(['title' => 'Blog', 'description' => '<p><strong>Blog1</strong></p>', 'SEOtitle' => 'Blog', 'SEOdescription' => 'Blog', 'SEOurl' => 'Blog', 'visibility' => 0]);
        CPage::create(['title' => 'About Us', 'description' => '<p>About Us</p>', 'SEOtitle' => 'About Us', 'SEOdescription' => 'About Us', 'SEOurl' => 'About Us', 'visibility' => 0]);
        CPage::create(['title' => 'Report Us', 'description' => '<h2><em>Report Us</em></h2>', 'SEOtitle' => 'Report Us', 'SEOdescription' => 'Report Us', 'SEOurl' => 'Report Us', 'visibility' => 0]);
        CPage::create(['title' => 'Donate Us', 'description' => '<p>Donate Us</p>', 'SEOtitle' => 'Donate Us', 'SEOdescription' => 'Donate Us', 'SEOurl' => 'Donate Us', 'visibility' => 1]);

        // Notifications from zappos.sql
        Notification::create(['title' => 'Registration Successful!', 'description' => 'Welcome to Zappos!']);
        Notification::create(['title' => 'Order Registered!', 'description' => 'Your Order#1 has been successfully registered!']);
        Notification::create(['title' => 'Password Changed!', 'description' => '<html></head></head><body><h1 style="color:red;">Hello</h1></body></html>']);
        Notification::create(['title' => 'Order Canceled!', 'description' => 'We are sorry to say that your order#21 has been canceled due to technical reasons!']);
        Notification::create(['title' => 'Order Refunded!', 'description' => 'Your payment for order#21 has been successfully refunded!']);
        Notification::create(['title' => 'Order Edited!', 'description' => 'Your Order#21 has been successfully edited!']);
        Notification::create(['title' => 'Order Confirmation!', 'description' => 'Your order#21 has been confirmed and will be delivered in two or 3 working days.']);

        // Store settings from zappos.sql
        Store::create(['StoreName' => 'Inspired By Nature', 'StoreEmail' => 'info@inspiredbynature.com', 'SenderEmail' => 'noreply@inspiredbynature.com', 'StoreIndustry' => 'Perfume', 'LegalName' => 'Inspired By Nature LLC', 'Phone' => '0301 5158089', 'Streets' => '20 Street, 20 Gulshan-E-Khudadad Main Blvd, Naseerabad', 'Apartment' => '', 'City' => 'Rawalpindi', 'ZipCode' => '44000', 'Country' => 'Pakistan', 'TimeZone' => 'UTC+5', 'UnitSystem' => 'metric', 'WeightUnit' => 'kg', 'Currency' => 'PKR']);

        // Tax from zappos.sql
        Tax::create(['digital' => '0', 'food' => '9', 'nonfood' => '21']);

        // Emarket (email subscribers)
        Emarket::create(['email' => 'hadibutt476@gmail.com']);

        // Nav items (top navigation bar)
        // Nav items (top navigation bar)
        $navItems = [
            ['label' => 'HOME', 'slug' => '', 'sort_order' => 1],
            ['label' => 'PERFUMES', 'slug' => 'perfumes', 'sort_order' => 2],
            ['label' => 'OILS', 'slug' => 'oils', 'sort_order' => 3],
            ['label' => 'BODY GEL AND HAIR MIST', 'slug' => 'body-gel-and-hair-mist', 'sort_order' => 4],
            ['label' => 'GIFT SETS', 'slug' => 'gift-sets', 'sort_order' => 5],
            ['label' => 'BAKHOOR AND BURNERS', 'slug' => 'bakhoor-and-burners', 'sort_order' => 6],
            ['label' => 'ROOM FRESHNERS', 'slug' => 'room-freshners', 'sort_order' => 7],
            ['label' => 'TAHAMI PERFUMES', 'slug' => 'tahami-perfumes', 'sort_order' => 8],
            ['label' => 'CONTACT US', 'slug' => 'contact-us', 'sort_order' => 9],
        ];
        foreach ($navItems as $n) {
            NavItem::create($n);
        }

        $this->call(StoreSeeder::class);
    }
}

