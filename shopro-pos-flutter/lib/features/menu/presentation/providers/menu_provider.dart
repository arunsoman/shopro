import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shopro_pos_flutter/features/menu/data/repositories/menu_repository.dart';
import 'package:shopro_pos_flutter/features/menu/domain/models/menu_models.dart';
import 'package:shopro_pos_flutter/core/network/api_client.dart';

final menuRepositoryProvider = Provider<MenuRepository>((ref) {
  return MenuRepository(apiClient);
});

class MenuState {
  final List<MenuCategory> categories;
  final List<MenuItem> items;
  final String? selectedCategoryId;
  final bool isLoading;
  final String? searchQuery;

  MenuState({
    this.categories = const [],
    this.items = const [],
    this.selectedCategoryId,
    this.isLoading = false,
    this.searchQuery,
  });

  MenuState copyWith({
    List<MenuCategory>? categories,
    List<MenuItem>? items,
    String? selectedCategoryId,
    bool? isLoading,
    String? searchQuery,
  }) {
    return MenuState(
      categories: categories ?? this.categories,
      items: items ?? this.items,
      selectedCategoryId: selectedCategoryId ?? this.selectedCategoryId,
      isLoading: isLoading ?? this.isLoading,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class MenuNotifier extends Notifier<MenuState> {
  @override
  MenuState build() {
    Future.microtask(() => loadMenu());
    return MenuState();
  }

  Future<void> loadMenu() async {
    state = state.copyWith(isLoading: true);
    try {
      final repository = ref.read(menuRepositoryProvider);
      final categories = await repository.getCategories();
      state = state.copyWith(
        categories: categories,
        selectedCategoryId: categories.isNotEmpty ? categories.first.id : null,
        isLoading: false,
      );
      if (state.selectedCategoryId != null) {
        await loadItems(state.selectedCategoryId!);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> selectCategory(String categoryId) async {
    if (state.selectedCategoryId == categoryId) return;
    state = state.copyWith(selectedCategoryId: categoryId, searchQuery: null);
    await loadItems(categoryId);
  }

  Future<void> loadItems(String categoryId) async {
    state = state.copyWith(isLoading: true);
    try {
      final repository = ref.read(menuRepositoryProvider);
      final items = await repository.getItemsByCategory(categoryId);
      state = state.copyWith(items: items, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> search(String query) async {
    if (query.isEmpty) {
      if (state.selectedCategoryId != null) {
        await loadItems(state.selectedCategoryId!);
      }
      state = state.copyWith(searchQuery: null);
      return;
    }

    state = state.copyWith(isLoading: true, searchQuery: query);
    try {
      final repository = ref.read(menuRepositoryProvider);
      final items = await repository.searchItems(query);
      state = state.copyWith(items: items, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }
}

final menuProvider = NotifierProvider<MenuNotifier, MenuState>(
  MenuNotifier.new,
);
