<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Products table description column
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'description')) {
                $table->text('description')->nullable();
            }
        });

        // 2. Stores table custom columns
        Schema::table('stores', function (Blueprint $table) {
            if (!Schema::hasColumn('stores', 'installed_apps')) {
                $table->text('installed_apps')->nullable();
            }
            if (!Schema::hasColumn('stores', 'fb_pixel')) {
                $table->text('fb_pixel')->nullable();
            }
            if (!Schema::hasColumn('stores', 'fb_conversions_api')) {
                $table->text('fb_conversions_api')->nullable();
            }
            if (!Schema::hasColumn('stores', 'fb_ad_account')) {
                $table->text('fb_ad_account')->nullable();
            }
            if (!Schema::hasColumn('stores', 'fb_page')) {
                $table->text('fb_page')->nullable();
            }
            if (!Schema::hasColumn('stores', 'fb_data_sharing')) {
                $table->text('fb_data_sharing')->nullable();
            }
            if (!Schema::hasColumn('stores', 'seo_settings')) {
                $table->text('seo_settings')->nullable();
            }
        });

        // 3. Marketing Campaigns Table
        if (!Schema::hasTable('marketing_campaigns')) {
            Schema::create('marketing_campaigns', function (Blueprint $table) {
                $table->id();
                $table->string('name', 255);
                $table->string('channel', 255);
                $table->string('status', 255);
                $table->string('budget', 255)->nullable();
                $table->string('revenue', 255)->nullable();
                $table->timestamps();
            });

            DB::table('marketing_campaigns')->insert([
                [
                    'name' => 'Summer Launch Newsletter',
                    'channel' => 'Email',
                    'status' => 'Active',
                    'budget' => 'Rs.5,000',
                    'revenue' => 'Rs.45,000',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name' => 'Facebook Spring Clearance',
                    'channel' => 'Paid Social',
                    'status' => 'Paused',
                    'budget' => 'Rs.15,000',
                    'revenue' => 'Rs.32,500',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // 4. Apps Table
        if (!Schema::hasTable('apps')) {
            Schema::create('apps', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('category');
                $table->text('description');
                $table->string('developer');
                $table->string('logo')->nullable();
                $table->string('link')->nullable();
                $table->timestamps();
            });

            DB::table('apps')->insert([
                [
                    'name' => 'Zarka Inbox',
                    'category' => 'Customer Service',
                    'description' => 'Real-time customer chat and support messages.',
                    'developer' => 'Zarka Couture',
                    'logo' => '',
                    'link' => '',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name' => 'Zarka Shipping',
                    'category' => 'Logistics',
                    'description' => 'Manage shipping rates, labels and tracking.',
                    'developer' => 'Zarka Couture',
                    'logo' => '',
                    'link' => '',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name' => 'Zarka Analytics',
                    'category' => 'Reporting',
                    'description' => 'Advanced sales, customer behavior and traffic reports.',
                    'developer' => 'Zarka Couture',
                    'logo' => '',
                    'link' => '',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'name' => 'Zarka SEO Optimizer',
                    'category' => 'Marketing',
                    'description' => 'Bulk edit meta tags, alt text and optimize site speed.',
                    'developer' => 'Zarka Couture',
                    'logo' => '',
                    'link' => '',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }

        // 5. Coupons Table Schema Migration (from old custom to new structured schema)
        if (Schema::hasTable('coupons')) {
            // Drop old columns and add new if they don't exist
            Schema::table('coupons', function (Blueprint $table) {
                if (!Schema::hasColumn('coupons', 'min_order_value')) {
                    $table->decimal('min_order_value', 10, 2)->default(0.00);
                }
                if (!Schema::hasColumn('coupons', 'starts_at')) {
                    $table->timestamp('starts_at')->nullable();
                }
                if (!Schema::hasColumn('coupons', 'expires_at')) {
                    $table->timestamp('expires_at')->nullable();
                }
                if (!Schema::hasColumn('coupons', 'is_active')) {
                    $table->boolean('is_active')->default(true);
                }
            });

            // Clean up and convert type column if it exists as string
            try {
                // Read existing coupons data
                $coupons = DB::table('coupons')->get();
                foreach ($coupons as $coupon) {
                    $isActive = true;
                    if (isset($coupon->status) && strtolower($coupon->status) !== 'active') {
                        $isActive = false;
                    }
                    
                    $expiresAt = null;
                    if (isset($coupon->expiry_date) && !empty($coupon->expiry_date)) {
                        try {
                            $expiresAt = \Carbon\Carbon::parse($coupon->expiry_date);
                        } catch (\Exception $e) {}
                    }

                    $type = 'percentage';
                    if (isset($coupon->type) && strtolower($coupon->type) === 'fixed') {
                        $type = 'fixed';
                    }

                    DB::table('coupons')->where('id', $coupon->id)->update([
                        'is_active' => $isActive,
                        'expires_at' => $expiresAt,
                    ]);
                }
            } catch (\Exception $e) {
                // Ignore conversion errors
            }

            // Drop status and expiry_date safely
            Schema::table('coupons', function (Blueprint $table) {
                if (Schema::hasColumn('coupons', 'status')) {
                    $table->dropColumn('status');
                }
                if (Schema::hasColumn('coupons', 'expiry_date')) {
                    $table->dropColumn('expiry_date');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apps');
        Schema::dropIfExists('marketing_campaigns');
    }
};
