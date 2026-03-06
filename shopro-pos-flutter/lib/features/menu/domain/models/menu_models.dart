enum MenuItemStatus { draft, published, archived }

class MenuCategory {
  final String id;
  final String name;
  final String? description;
  final String? photoUrl;
  final int displayOrder;
  final int defaultCourse;

  MenuCategory({
    required this.id,
    required this.name,
    this.description,
    this.photoUrl,
    this.displayOrder = 0,
    this.defaultCourse = 1,
  });

  factory MenuCategory.fromJson(Map<String, dynamic> json) {
    return MenuCategory(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      photoUrl: json['photoUrl'],
      displayOrder: json['displayOrder'] ?? 0,
      defaultCourse: json['defaultCourse'] ?? 1,
    );
  }
}

class MenuItem {
  final String id;
  final String name;
  final String? description;
  final double basePrice;
  final String? photoUrl;
  final MenuItemStatus status;
  final String categoryId;
  final List<ModifierGroup> modifierGroups;

  MenuItem({
    required this.id,
    required this.name,
    this.description,
    required this.basePrice,
    this.photoUrl,
    required this.status,
    required this.categoryId,
    this.modifierGroups = const [],
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      basePrice: (json['basePrice'] as num).toDouble(),
      photoUrl: json['photoUrl'],
      status: MenuItemStatus.values.firstWhere(
        (e) => e.name.toUpperCase() == json['status'],
        orElse: () => MenuItemStatus.draft,
      ),
      categoryId: json['categoryId'],
      modifierGroups:
          (json['modifierGroups'] as List?)
              ?.map((m) => ModifierGroup.fromJson(m))
              .toList() ??
          const [],
    );
  }
}

class ModifierGroup {
  final String id;
  final String name;
  final bool required;
  final int minSelections;
  final int maxSelections;
  final List<ModifierOption> options;

  ModifierGroup({
    required this.id,
    required this.name,
    required this.required,
    this.minSelections = 0,
    this.maxSelections = 1,
    this.options = const [],
  });

  factory ModifierGroup.fromJson(Map<String, dynamic> json) {
    return ModifierGroup(
      id: json['id'],
      name: json['name'],
      required: json['required'] ?? false,
      minSelections: json['minSelections'] ?? 0,
      maxSelections: json['maxSelections'] ?? 1,
      options:
          (json['options'] as List?)
              ?.map((o) => ModifierOption.fromJson(o))
              .toList() ??
          const [],
    );
  }
}

class ModifierOption {
  final String id;
  final String label;
  final double upchargeAmount;

  ModifierOption({
    required this.id,
    required this.label,
    required this.upchargeAmount,
  });

  factory ModifierOption.fromJson(Map<String, dynamic> json) {
    return ModifierOption(
      id: json['id'],
      label: json['label'],
      upchargeAmount: (json['upchargeAmount'] as num).toDouble(),
    );
  }
}
