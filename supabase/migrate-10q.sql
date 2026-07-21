-- Переход на 10 вопросов в дуэли: снять ограничение score 0..7, поставить 0..10.
alter table runs drop constraint if exists runs_score_check;
alter table runs add constraint runs_score_check check (score between 0 and 10);
