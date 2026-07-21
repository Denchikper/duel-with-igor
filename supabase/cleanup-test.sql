-- Убрать тестовый мусор (мой проверочный забег test10).
delete from runs  where tg_user_id = 999999;
delete from duels where created_by = 999999;

-- Если хочешь чистый лидерборд к демо — раскомментируй, снесёт ВСЕ забеги:
-- truncate table runs, duels restart identity;
