import 'package:shopro_pos_flutter/core/network/api_client.dart';
import 'package:shopro_pos_flutter/features/menu/domain/models/menu_models.dart';

class MenuRepository {
  final ApiClient _apiClient;

  MenuRepository(this._apiClient);

  Future<List<MenuCategory>> getCategories() async {
    final response = await _apiClient.get('/menu-categories');
    final List data = response.data;
    return data.map((json) => MenuCategory.fromJson(json)).toList();
  }

  Future<List<MenuItem>> getItemsByCategory(String categoryId) async {
    final response = await _apiClient.get(
      '/menu-items',
      queryParameters: {'categoryId': categoryId, 'status': 'PUBLISHED'},
    );
    final List data = response.data;
    return data.map((json) => MenuItem.fromJson(json)).toList();
  }

  Future<List<MenuItem>> searchItems(String query) async {
    final response = await _apiClient.get(
      '/menu-items/search',
      queryParameters: {'q': query},
    );
    final List data = response.data;
    return data.map((json) => MenuItem.fromJson(json)).toList();
  }
}
