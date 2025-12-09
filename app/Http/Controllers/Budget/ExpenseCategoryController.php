<?php

namespace App\Http\Controllers\Budget;

use App\Http\Controllers\Controller;
use App\Models\ExpenseCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

/**
 * Controller for managing expense categories.
 *
 * Handles CRUD operations for user-created expense categories.
 */
class ExpenseCategoryController extends Controller
{
    /**
     * Store a new expense category.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|size:7',
            'icon' => 'nullable|string|max:50',
        ]);

        $slug = Str::slug($validated['name']);

        // Check if slug already exists for this user
        $exists = ExpenseCategory::where('user_id', Auth::id())
            ->where('slug', $slug)
            ->exists();

        if ($exists) {
            return back()->withErrors(['name' => 'Cette catégorie existe déjà']);
        }

        // Get max sort order for user categories
        $maxOrder = ExpenseCategory::where('user_id', Auth::id())
            ->max('sort_order') ?? 100;

        ExpenseCategory::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'slug' => $slug,
            'color' => $validated['color'] ?? '#6366f1',
            'icon' => $validated['icon'] ?? 'Tag',
            'is_system' => false,
            'sort_order' => $maxOrder + 1,
        ]);

        return back()->with('success', 'Category created successfully');
    }

    /**
     * Update an existing expense category.
     *
     * @param Request $request
     * @param ExpenseCategory $category
     * @return RedirectResponse
     */
    public function update(Request $request, ExpenseCategory $category): RedirectResponse
    {
        // Only owner can update, and system categories can only update color/icon
        if ($category->user_id !== Auth::id() && !$category->is_system) {
            abort(403);
        }

        $rules = [
            'color' => 'nullable|string|size:7',
            'icon' => 'nullable|string|max:50',
        ];

        // Only allow name change for non-system categories
        if (!$category->is_system) {
            $rules['name'] = 'required|string|max:255';
        }

        $validated = $request->validate($rules);

        // Update name and slug only for non-system categories
        if (!$category->is_system && isset($validated['name'])) {
            $category->name = $validated['name'];
            $category->slug = Str::slug($validated['name']);
        }

        if (isset($validated['color'])) {
            $category->color = $validated['color'];
        }

        if (isset($validated['icon'])) {
            $category->icon = $validated['icon'];
        }

        $category->save();

        return back()->with('success', 'Category updated successfully');
    }

    /**
     * Delete an expense category.
     *
     * @param ExpenseCategory $category
     * @return RedirectResponse
     */
    public function destroy(ExpenseCategory $category): RedirectResponse
    {
        // System categories cannot be deleted
        if ($category->is_system) {
            return back()->withErrors(['category' => 'System categories cannot be deleted']);
        }

        // Only owner can delete
        if ($category->user_id !== Auth::id()) {
            abort(403);
        }

        // Check if category has expenses
        if ($category->expenses()->exists()) {
            return back()->withErrors(['category' => 'Cannot delete category with existing expenses']);
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully');
    }
}
