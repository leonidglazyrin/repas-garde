-- Préférences alimentaires détaillées par profil
alter table if exists members add column if not exists dislikes text not null default '';
alter table if exists members add column if not exists favorites text not null default '';
alter table if exists members add column if not exists normal_foods text not null default '';
