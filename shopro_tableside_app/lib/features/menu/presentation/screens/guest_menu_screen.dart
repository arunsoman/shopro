import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shopro_tableside_app/core/theme/app_colors.dart';
import 'package:shopro_tableside_app/core/theme/app_spacing.dart';
import '../../domain/models/menu_models.dart';
import '../providers/menu_providers.dart';

/// Routes image URLs through our Node proxy for transcoding + caching.
/// External URLs (Unsplash etc.) are proxied via /img?url=
/// Internal URLs (already /api/v1/media/...) are appended to the proxy host.
String proxyImageUrl(String? raw) {
  if (raw == null || raw.isEmpty) return '';
  if (raw.startsWith('/')) {
    // Internal backend asset
    return '/img?url=${Uri.encodeComponent(raw)}';
  }
  // External URL — transcode via proxy
  return '/img?url=${Uri.encodeComponent(raw)}';
}

class GuestMenuScreen extends ConsumerStatefulWidget {
  const GuestMenuScreen({super.key});

  @override
  ConsumerState<GuestMenuScreen> createState() => _GuestMenuScreenState();
}

class _GuestMenuScreenState extends ConsumerState<GuestMenuScreen> {
  String? selectedCategoryId;
  String searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoriesProvider);
    final cartItems = ref.watch(cartProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Menu',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        centerTitle: false,
        actions: [
          IconButton(
            onPressed: () => _showSearchDialog(),
            icon: const Icon(LucideIcons.search),
          ),
          _buildCartBadge(cartItems.length),
          const SizedBox(width: AppSpacing.s),
        ],
      ),
      body: Column(
        children: [
          // Categories
          categoriesAsync.when(
            data: (categories) {
              if (selectedCategoryId == null && categories.isNotEmpty) {
                Future.microtask(
                  () =>
                      setState(() => selectedCategoryId = categories.first.id),
                );
              }
              return _buildCategoryTabs(categories, isDark);
            },
            loading: () => _buildCategorySkeleton(isDark),
            error: (err, stack) => Padding(
              padding: const EdgeInsets.all(AppSpacing.m),
              child: _buildErrorState(
                'Error loading categories',
                err.toString(),
              ),
            ),
          ),

          // Menu Items Grid
          Expanded(
            child: selectedCategoryId == null
                ? _buildMenuGridSkeleton()
                : ref
                      .watch(menuItemsProvider(selectedCategoryId!))
                      .when(
                        data: (items) => _buildMenuGrid(items),
                        loading: () => _buildMenuGridSkeleton(),
                        error: (err, stack) => Center(
                          child: _buildErrorState(
                            'Error loading items',
                            err.toString(),
                          ),
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: cartItems.isNotEmpty
          ? _buildSubmitOrderFab()
          : null,
    );
  }

  Widget _buildCategorySkeleton(bool isDark) {
    return SizedBox(
      height: 60,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.m),
        itemCount: 4,
        itemBuilder: (context, index) => Padding(
          padding: const EdgeInsets.only(
            right: AppSpacing.s,
            top: 12,
            bottom: 12,
          ),
          child:
              Container(
                    width: 80,
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white10
                          : Colors.black.withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(20),
                    ),
                  )
                  .animate(onPlay: (controller) => controller.repeat())
                  .shimmer(
                    duration: 1200.ms,
                    color: AppColors.primary.withValues(alpha: 0.1),
                  ),
        ),
      ),
    );
  }

  Widget _buildMenuGridSkeleton() {
    return GridView.builder(
      padding: const EdgeInsets.all(AppSpacing.m),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.75,
        crossAxisSpacing: AppSpacing.m,
        mainAxisSpacing: AppSpacing.m,
      ),
      itemCount: 6,
      itemBuilder: (context, index) =>
          Card(
                clipBehavior: Clip.antiAlias,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Container(
                        color: Colors.black.withValues(alpha: 0.05),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(AppSpacing.s),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            height: 16,
                            width: double.infinity,
                            color: Colors.black.withValues(alpha: 0.05),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            height: 14,
                            width: 60,
                            color: Colors.black.withValues(alpha: 0.05),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )
              .animate(onPlay: (controller) => controller.repeat())
              .shimmer(duration: 1200.ms, color: Colors.white24),
    );
  }

  Widget _buildErrorState(String title, String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.l),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(LucideIcons.alertCircle, color: Colors.red, size: 48),
            const SizedBox(height: AppSpacing.m),
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            const SizedBox(height: AppSpacing.s),
            Text(
              error,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600]),
            ),
            const SizedBox(height: AppSpacing.l),
            ElevatedButton.icon(
              onPressed: () => ref.invalidate(categoriesProvider),
              icon: const Icon(LucideIcons.refreshCcw),
              label: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCartBadge(int count) {
    return Stack(
      children: [
        IconButton(
          onPressed: () => context.push('/cart'),
          icon: const Icon(LucideIcons.shoppingCart),
        ),
        if (count > 0)
          Positioned(
            right: 8,
            top: 8,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: Text(
                '$count',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildCategoryTabs(List<MenuCategory> categories, bool isDark) {
    return SizedBox(
      height: 60,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.m),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = selectedCategoryId == category.id;
          return Padding(
            padding: const EdgeInsets.only(right: AppSpacing.s),
            child: ChoiceChip(
              label: Text(category.name),
              selected: isSelected,
              onSelected: (selected) {
                if (selected) setState(() => selectedCategoryId = category.id);
              },
              selectedColor: AppColors.primary,
              labelStyle: TextStyle(
                color: isSelected
                    ? Colors.white
                    : (isDark ? AppColors.darkText : AppColors.lightText),
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildMenuGrid(List<MenuItem> items) {
    final filteredItems = items
        .where((i) => i.name.toLowerCase().contains(searchQuery.toLowerCase()))
        .toList();

    if (filteredItems.isEmpty) {
      return const Center(child: Text('No items found matching your search.'));
    }

    return GridView.builder(
      padding: const EdgeInsets.all(AppSpacing.m),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.75,
        crossAxisSpacing: AppSpacing.m,
        mainAxisSpacing: AppSpacing.m,
      ),
      itemCount: filteredItems.length,
      itemBuilder: (context, index) {
        return MenuGridItem(
          item: filteredItems[index],
        ).animate().fadeIn(delay: (index * 50).ms).slideY(begin: 0.1);
      },
    );
  }

  Widget _buildSubmitOrderFab() {
    return FloatingActionButton.extended(
      onPressed: () => _handleSubmitOrder(),
      backgroundColor: AppColors.primary,
      icon: const Icon(LucideIcons.send, color: Colors.white),
      label: const Text(
        'Confirm Order',
        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
    ).animate().scale();
  }

  void _handleSubmitOrder() async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      await ref.read(cartProvider.notifier).submitOrder();
      if (mounted) {
        Navigator.pop(context); // Close loading
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Order sent to kitchen!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        Navigator.pop(context); // Close loading
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error submitting order: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _showSearchDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Search Menu'),
        content: TextField(
          controller: _searchController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Enter item name...',
            prefixIcon: Icon(LucideIcons.search),
          ),
          onChanged: (val) => setState(() => searchQuery = val),
        ),
        actions: [
          TextButton(
            onPressed: () {
              setState(() {
                searchQuery = '';
                _searchController.clear();
              });
              Navigator.pop(context);
            },
            child: const Text('Clear'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Done'),
          ),
        ],
      ),
    );
  }
}

class MenuGridItem extends ConsumerWidget {
  final MenuItem item;

  const MenuGridItem({super.key, required this.item});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      clipBehavior: Clip.antiAlias,
      elevation: 2,
      child: InkWell(
        onTap: () {
          ref.read(cartProvider.notifier).addItem(item);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Added ${item.name} to cart'),
              duration: 1.seconds,
              behavior: SnackBarBehavior.floating,
              width: 200,
            ),
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (item.photoUrl != null && item.photoUrl!.isNotEmpty)
                    Image.network(
                      proxyImageUrl(item.photoUrl),
                      fit: BoxFit.cover,
                      // Show skeleton while loading
                      frameBuilder: (ctx, child, frame, _) => frame == null
                          ? Container(
                              color: Colors.black.withValues(alpha: 0.05),
                            )
                          : child,
                      errorBuilder: (_, _, _) => Container(
                        color: Colors.grey[200],
                        child: const Icon(
                          LucideIcons.image,
                          color: Colors.grey,
                        ),
                      ),
                    )
                  else
                    Container(
                      color: Colors.grey[200],
                      child: const Icon(LucideIcons.image, color: Colors.grey),
                    ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: IconButton(
                      icon: const Icon(
                        LucideIcons.plusCircle,
                        color: AppColors.primary,
                      ),
                      onPressed: () {
                        ref.read(cartProvider.notifier).addItem(item);
                      },
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(AppSpacing.s),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '\$${item.basePrice.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
