import 'edp_event.dart';

/// Base class for all EDP state reducers.
/// Reducers are responsible for taking a current state and an event,
/// and returning a new state. This keeps logic outside of Notifiers.
abstract class EdpReducer<T> {
  T reduce(T state, EdpEvent event);
}
