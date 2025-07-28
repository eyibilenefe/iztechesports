-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.announcement_media (
  announcement_id bigint NOT NULL,
  media_id bigint NOT NULL,
  CONSTRAINT announcement_media_pkey PRIMARY KEY (announcement_id, media_id),
  CONSTRAINT announcement_media_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES public.announcements(id),
  CONSTRAINT announcement_media_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media(id)
);
CREATE TABLE public.announcements (
  id bigint NOT NULL DEFAULT nextval('announcements_id_seq'::regclass),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  content text,
  type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT announcements_pkey PRIMARY KEY (id),
  CONSTRAINT announcements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.games (
  id bigint NOT NULL DEFAULT nextval('games_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  genre text,
  icon_url text,
  is_active boolean NOT NULL DEFAULT true,
  CONSTRAINT games_pkey PRIMARY KEY (id)
);
CREATE TABLE public.giveaway_participants (
  id bigint NOT NULL DEFAULT nextval('giveaway_participants_id_seq'::regclass),
  giveaway_id bigint NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT giveaway_participants_pkey PRIMARY KEY (id),
  CONSTRAINT giveaway_participants_giveaway_id_fkey FOREIGN KEY (giveaway_id) REFERENCES public.giveaways(id),
  CONSTRAINT giveaway_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.giveaways (
  id bigint NOT NULL DEFAULT nextval('giveaways_id_seq'::regclass),
  announcement_id bigint NOT NULL UNIQUE,
  prize text NOT NULL,
  draw_date timestamp with time zone NOT NULL,
  winner_user_id uuid,
  CONSTRAINT giveaways_pkey PRIMARY KEY (id),
  CONSTRAINT giveaways_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES public.announcements(id),
  CONSTRAINT giveaways_winner_user_id_fkey FOREIGN KEY (winner_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.lobbies (
  id bigint NOT NULL DEFAULT nextval('lobbies_id_seq'::regclass),
  creator_user_id uuid NOT NULL,
  game_id bigint NOT NULL,
  max_participants integer NOT NULL,
  status text NOT NULL DEFAULT 'open'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  tournament_id bigint,
  name text,
  description text,
  CONSTRAINT lobbies_pkey PRIMARY KEY (id),
  CONSTRAINT lobbies_creator_user_id_fkey FOREIGN KEY (creator_user_id) REFERENCES public.profiles(id),
  CONSTRAINT lobbies_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id),
  CONSTRAINT lobbies_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id)
);
CREATE TABLE public.lobby_invitations (
  id bigint NOT NULL DEFAULT nextval('lobby_invitations_id_seq'::regclass),
  lobby_id bigint NOT NULL,
  invited_user_id uuid NOT NULL,
  inviter_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  CONSTRAINT lobby_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT lobby_invitations_lobby_id_fkey FOREIGN KEY (lobby_id) REFERENCES public.lobbies(id),
  CONSTRAINT lobby_invitations_invited_user_id_fkey FOREIGN KEY (invited_user_id) REFERENCES public.profiles(id),
  CONSTRAINT lobby_invitations_inviter_user_id_fkey FOREIGN KEY (inviter_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.lobby_join_requests (
  id bigint NOT NULL DEFAULT nextval('lobby_join_requests_id_seq'::regclass),
  lobby_id bigint NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  CONSTRAINT lobby_join_requests_pkey PRIMARY KEY (id),
  CONSTRAINT lobby_join_requests_lobby_id_fkey FOREIGN KEY (lobby_id) REFERENCES public.lobbies(id),
  CONSTRAINT lobby_join_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.lobby_participants (
  id bigint NOT NULL DEFAULT nextval('lobby_participants_id_seq'::regclass),
  lobby_id bigint NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT lobby_participants_pkey PRIMARY KEY (id),
  CONSTRAINT lobby_participants_lobby_id_fkey FOREIGN KEY (lobby_id) REFERENCES public.lobbies(id),
  CONSTRAINT lobby_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.match_history (
  id bigint NOT NULL DEFAULT nextval('match_history_id_seq'::regclass),
  lobby_id bigint UNIQUE,
  tournament_id bigint,
  game_id bigint NOT NULL,
  completion_time timestamp with time zone NOT NULL DEFAULT now(),
  result_summary text,
  match_format text DEFAULT 'Bo1'::text CHECK (match_format = ANY (ARRAY['Bo1'::text, 'Bo3'::text, 'Bo5'::text, 'Bo7'::text])),
  total_sets integer DEFAULT 1,
  team1_total_score integer DEFAULT 0,
  team2_total_score integer DEFAULT 0,
  best_of integer DEFAULT 1,
  CONSTRAINT match_history_pkey PRIMARY KEY (id),
  CONSTRAINT match_history_lobby_id_fkey FOREIGN KEY (lobby_id) REFERENCES public.lobbies(id),
  CONSTRAINT match_history_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id),
  CONSTRAINT match_history_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id)
);
CREATE TABLE public.match_participants (
  id bigint NOT NULL DEFAULT nextval('match_participants_id_seq'::regclass),
  match_id bigint NOT NULL,
  user_id uuid NOT NULL,
  team_id bigint,
  is_winner boolean,
  stats jsonb,
  CONSTRAINT match_participants_pkey PRIMARY KEY (id),
  CONSTRAINT match_participants_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.match_history(id),
  CONSTRAINT match_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT match_participants_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.match_sets (
  id bigint NOT NULL DEFAULT nextval('match_sets_id_seq'::regclass),
  match_id bigint NOT NULL,
  set_number integer NOT NULL CHECK (set_number > 0),
  team1_score integer NOT NULL DEFAULT 0,
  team2_score integer NOT NULL DEFAULT 0,
  winner_team_id bigint,
  winner_user_id uuid,
  duration interval,
  map_name text,
  set_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT match_sets_pkey PRIMARY KEY (id),
  CONSTRAINT match_sets_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.match_history(id),
  CONSTRAINT match_sets_winner_team_id_fkey FOREIGN KEY (winner_team_id) REFERENCES public.teams(id),
  CONSTRAINT match_sets_winner_user_id_fkey FOREIGN KEY (winner_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.media (
  id bigint NOT NULL DEFAULT nextval('media_id_seq'::regclass),
  uploader_user_id uuid NOT NULL,
  url text NOT NULL UNIQUE,
  media_type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT media_pkey PRIMARY KEY (id),
  CONSTRAINT media_uploader_user_id_fkey FOREIGN KEY (uploader_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.notifications (
  id bigint NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
  user_id uuid NOT NULL,
  content text NOT NULL,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.poll_options (
  id bigint NOT NULL DEFAULT nextval('poll_options_id_seq'::regclass),
  poll_id bigint NOT NULL,
  option_text character varying NOT NULL,
  CONSTRAINT poll_options_pkey PRIMARY KEY (id),
  CONSTRAINT poll_options_poll_id_fkey FOREIGN KEY (poll_id) REFERENCES public.polls(id)
);
CREATE TABLE public.poll_responses (
  id bigint NOT NULL DEFAULT nextval('poll_responses_id_seq'::regclass),
  user_id uuid NOT NULL,
  poll_option_id bigint NOT NULL,
  answered_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT poll_responses_pkey PRIMARY KEY (id),
  CONSTRAINT poll_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT poll_responses_poll_option_id_fkey FOREIGN KEY (poll_option_id) REFERENCES public.poll_options(id)
);
CREATE TABLE public.polls (
  id bigint NOT NULL DEFAULT nextval('polls_id_seq'::regclass),
  announcement_id bigint NOT NULL UNIQUE,
  question text NOT NULL,
  CONSTRAINT polls_pkey PRIMARY KEY (id),
  CONSTRAINT polls_announcement_id_fkey FOREIGN KEY (announcement_id) REFERENCES public.announcements(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text UNIQUE,
  full_name text,
  profile_picture_url text,
  role text NOT NULL DEFAULT 'user'::text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.team_members (
  id bigint NOT NULL DEFAULT nextval('team_members_id_seq'::regclass),
  team_id bigint NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.teams (
  id bigint NOT NULL DEFAULT nextval('teams_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  tag character varying NOT NULL UNIQUE,
  logo_url text,
  creator_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_creator_user_id_fkey FOREIGN KEY (creator_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.tournament_details (
  tournament_id bigint NOT NULL,
  description text,
  rules text,
  prize_pool text,
  format text,
  participant_type text NOT NULL CHECK (participant_type = ANY (ARRAY['team'::text, 'individual'::text])),
  max_participants integer,
  registration_deadline timestamp with time zone,
  status text NOT NULL DEFAULT 'upcoming'::text CHECK (status = ANY (ARRAY['upcoming'::text, 'registration_open'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text])),
  banner_image_url text,
  match_format text DEFAULT 'Bo1'::text CHECK (match_format = ANY (ARRAY['Bo1'::text, 'Bo3'::text, 'Bo5'::text, 'Bo7'::text])),
  best_of integer DEFAULT 1,
  CONSTRAINT tournament_details_pkey PRIMARY KEY (tournament_id),
  CONSTRAINT tournament_details_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id)
);
CREATE TABLE public.tournament_invitations (
  id bigint NOT NULL DEFAULT nextval('tournament_invitations_id_seq'::regclass),
  tournament_id bigint NOT NULL,
  invited_user_id uuid NOT NULL,
  inviter_user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  responded_at timestamp with time zone,
  CONSTRAINT tournament_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT tournament_invitations_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id),
  CONSTRAINT tournament_invitations_invited_user_id_fkey FOREIGN KEY (invited_user_id) REFERENCES public.profiles(id),
  CONSTRAINT tournament_invitations_inviter_user_id_fkey FOREIGN KEY (inviter_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.tournament_matches (
  id bigint NOT NULL DEFAULT nextval('tournament_matches_id_seq'::regclass),
  tournament_id bigint NOT NULL,
  round integer NOT NULL,
  match_number integer NOT NULL,
  team1_id bigint,
  team2_id bigint,
  user1_id uuid,
  user2_id uuid,
  scheduled_time timestamp with time zone,
  winner_team_id bigint,
  winner_user_id uuid,
  score text,
  status text NOT NULL DEFAULT 'scheduled'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tournament_matches_pkey PRIMARY KEY (id),
  CONSTRAINT tournament_matches_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id),
  CONSTRAINT tournament_matches_team1_id_fkey FOREIGN KEY (team1_id) REFERENCES public.teams(id),
  CONSTRAINT tournament_matches_team2_id_fkey FOREIGN KEY (team2_id) REFERENCES public.teams(id),
  CONSTRAINT tournament_matches_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.profiles(id),
  CONSTRAINT tournament_matches_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.profiles(id),
  CONSTRAINT tournament_matches_winner_team_id_fkey FOREIGN KEY (winner_team_id) REFERENCES public.teams(id),
  CONSTRAINT tournament_matches_winner_user_id_fkey FOREIGN KEY (winner_user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.tournament_participants (
  id bigint NOT NULL DEFAULT nextval('tournament_participants_id_seq'::regclass),
  tournament_id bigint NOT NULL,
  participant_type text NOT NULL,
  team_id bigint,
  user_id uuid,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT tournament_participants_pkey PRIMARY KEY (id),
  CONSTRAINT tournament_participants_tournament_id_fkey FOREIGN KEY (tournament_id) REFERENCES public.tournaments(id),
  CONSTRAINT tournament_participants_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT tournament_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.tournaments (
  id bigint NOT NULL DEFAULT nextval('tournaments_id_seq'::regclass),
  name character varying NOT NULL,
  game_id bigint NOT NULL,
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone NOT NULL,
  CONSTRAINT tournaments_pkey PRIMARY KEY (id),
  CONSTRAINT tournaments_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id)
);
CREATE TABLE public.user_game_profiles (
  id bigint NOT NULL DEFAULT nextval('user_game_profiles_id_seq'::regclass),
  user_id uuid NOT NULL,
  game_id bigint NOT NULL,
  nickname character varying NOT NULL,
  rank text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT user_game_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_game_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_game_profiles_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id)
);
CREATE TABLE public.user_game_stats (
  id bigint NOT NULL DEFAULT nextval('user_game_stats_id_seq'::regclass),
  user_id uuid NOT NULL,
  game_id bigint NOT NULL,
  matches_played integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  total_score integer NOT NULL DEFAULT 0,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_game_stats_pkey PRIMARY KEY (id),
  CONSTRAINT user_game_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT user_game_stats_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.games(id)
);

-- =================================================================
-- USER_GAME_PROFILES Tablosu Güncellemeleri
-- =================================================================

-- Eğer created_at ve updated_at sütunları yoksa ekle
ALTER TABLE public.user_game_profiles 
ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NOT NULL DEFAULT now();

ALTER TABLE public.user_game_profiles 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;

-- Mevcut kayıtlar için created_at değerini güncelle (eğer NULL ise)
UPDATE public.user_game_profiles 
SET created_at = now() 
WHERE created_at IS NULL;

-- updated_at trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at trigger'ını oluştur (eğer yoksa)
DROP TRIGGER IF EXISTS update_user_game_profiles_updated_at ON public.user_game_profiles;
CREATE TRIGGER update_user_game_profiles_updated_at
    BEFORE UPDATE ON public.user_game_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- LOBBY BAZLI DAVET SİSTEMİ İÇİN GEREKLİ TABLOLAR
-- =================================================================

-- Sequence oluştur (eğer yoksa) - ÖNCE SEQUENCE OLUŞTUR
CREATE SEQUENCE IF NOT EXISTS public.lobby_invitations_id_seq
    AS bigint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- LOBBY_INVITATIONS tablosu (eğer yoksa oluştur)
CREATE TABLE IF NOT EXISTS public.lobby_invitations (
    id bigint NOT NULL DEFAULT nextval('lobby_invitations_id_seq'::regclass),
    lobby_id bigint NOT NULL,
    invited_user_id uuid NOT NULL,
    inviter_user_id uuid NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text CHECK (status IN ('pending', 'accepted', 'rejected')),
    invited_at timestamp with time zone NOT NULL DEFAULT now(),
    responded_at timestamp with time zone,
    CONSTRAINT lobby_invitations_pkey PRIMARY KEY (id),
    CONSTRAINT lobby_invitations_lobby_id_fkey FOREIGN KEY (lobby_id) REFERENCES public.lobbies(id) ON DELETE CASCADE,
    CONSTRAINT lobby_invitations_invited_user_id_fkey FOREIGN KEY (invited_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT lobby_invitations_inviter_user_id_fkey FOREIGN KEY (inviter_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT lobby_invitations_unique UNIQUE (lobby_id, invited_user_id)
);

-- Sequence'i tabloya bağla
ALTER SEQUENCE public.lobby_invitations_id_seq OWNED BY public.lobby_invitations.id;

-- =================================================================
-- LOBBY BAZLI DAVET SİSTEMİ İÇİN RLS POLİTİKALARI
-- =================================================================

-- LOBBY_INVITATIONS için RLS'yi etkinleştir
ALTER TABLE public.lobby_invitations ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (eğer varsa)
DROP POLICY IF EXISTS "Kullanıcılar kendi davetlerini görebilir." ON public.lobby_invitations;
DROP POLICY IF EXISTS "Giriş yapmış kullanıcılar davet gönderebilir." ON public.lobby_invitations;
DROP POLICY IF EXISTS "Davet edilen kullanıcı daveti yanıtlayabilir." ON public.lobby_invitations;
DROP POLICY IF EXISTS "Davet edilen kullanıcı daveti silebilir." ON public.lobby_invitations;

-- Yeni politikaları oluştur
CREATE POLICY "Kullanıcılar kendi davetlerini görebilir."
ON public.lobby_invitations FOR SELECT
USING (auth.uid() = invited_user_id OR auth.uid() = inviter_user_id);

CREATE POLICY "Giriş yapmış kullanıcılar davet gönderebilir."
ON public.lobby_invitations FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = inviter_user_id);

CREATE POLICY "Davet edilen kullanıcı daveti yanıtlayabilir."
ON public.lobby_invitations FOR UPDATE
USING (auth.uid() = invited_user_id)
WITH CHECK (auth.uid() = invited_user_id);

CREATE POLICY "Davet edilen kullanıcı daveti silebilir."
ON public.lobby_invitations FOR DELETE
USING (auth.uid() = invited_user_id);

-- =================================================================
-- LOBBY BAZLI DAVET SİSTEMİ İÇİN YARDIMCI FONKSİYONLAR
-- =================================================================

-- Lobi daveti gönderme fonksiyonu
CREATE OR REPLACE FUNCTION send_lobby_invitation(
    p_lobby_id bigint,
    p_invited_user_id uuid,
    p_inviter_user_id uuid
)
RETURNS json AS $$
DECLARE
    v_invitation_id bigint;
    v_lobby_name text;
    v_inviter_name text;
BEGIN
    -- Lobi bilgilerini al
    SELECT name INTO v_lobby_name 
    FROM public.lobbies 
    WHERE id = p_lobby_id;
    
    -- Davet eden kullanıcı bilgilerini al
    SELECT username INTO v_inviter_name 
    FROM public.profiles 
    WHERE id = p_inviter_user_id;
    
    -- Davet oluştur
    INSERT INTO public.lobby_invitations (lobby_id, invited_user_id, inviter_user_id)
    VALUES (p_lobby_id, p_invited_user_id, p_inviter_user_id)
    RETURNING id INTO v_invitation_id;
    
    -- Bildirim oluştur
    INSERT INTO public.notifications (user_id, content, link)
    VALUES (
        p_invited_user_id,
        v_inviter_name || ' sizi "' || v_lobby_name || '" lobisine davet etti.',
        '/lobby-invitations/' || v_invitation_id
    );
    
    RETURN json_build_object(
        'success', true,
        'invitation_id', v_invitation_id,
        'message', 'Davet başarıyla gönderildi'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lobi davetini yanıtlama fonksiyonu
CREATE OR REPLACE FUNCTION respond_to_lobby_invitation(
    p_invitation_id bigint,
    p_status text,
    p_user_id uuid
)
RETURNS json AS $$
DECLARE
    v_lobby_id bigint;
    v_inviter_id uuid;
    v_lobby_name text;
    v_invited_name text;
BEGIN
    -- Davet bilgilerini kontrol et ve güncelle
    UPDATE public.lobby_invitations 
    SET status = p_status, responded_at = now()
    WHERE id = p_invitation_id AND invited_user_id = p_user_id
    RETURNING lobby_id, inviter_user_id INTO v_lobby_id, v_inviter_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Davet bulunamadı veya yetkiniz yok'
        );
    END IF;
    
    -- Lobi ve kullanıcı bilgilerini al
    SELECT name INTO v_lobby_name FROM public.lobbies WHERE id = v_lobby_id;
    SELECT username INTO v_invited_name FROM public.profiles WHERE id = p_user_id;
    
    -- Eğer davet kabul edildiyse lobiye katıl
    IF p_status = 'accepted' THEN
        INSERT INTO public.lobby_participants (lobby_id, user_id)
        VALUES (v_lobby_id, p_user_id)
        ON CONFLICT (lobby_id, user_id) DO NOTHING;
        
        -- Davet eden kullanıcıya bildirim gönder
        INSERT INTO public.notifications (user_id, content, link)
        VALUES (
            v_inviter_id,
            v_invited_name || ' lobi davetinizi kabul etti.',
            '/lobbies/' || v_lobby_id
        );
    ELSE
        -- Davet eden kullanıcıya red bildirimi gönder
        INSERT INTO public.notifications (user_id, content, link)
        VALUES (
            v_inviter_id,
            v_invited_name || ' lobi davetinizi reddetti.',
            '/lobbies/' || v_lobby_id
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Davet yanıtlandı'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =================================================================
-- LOBBY_PARTICIPANTS TABLOSU İÇİN UNIQUE CONSTRAINT
-- =================================================================

-- Aynı kullanıcının aynı lobiye birden fazla kez katılmasını engelle
-- Önce constraint'i kontrol et ve varsa sil
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'lobby_participants_unique' 
        AND table_name = 'lobby_participants'
    ) THEN
        ALTER TABLE public.lobby_participants DROP CONSTRAINT lobby_participants_unique;
    END IF;
END $$;

-- Yeni constraint'i ekle
ALTER TABLE public.lobby_participants 
ADD CONSTRAINT lobby_participants_unique 
UNIQUE (lobby_id, user_id);

-- =================================================================
-- VERİTABANI ŞEMASINI GÜNCELLE
-- =================================================================

-- Schema cache'ini temizle (Supabase otomatik olarak yapacak)
-- Bu sorgu schema cache'inin yenilenmesini sağlar
SELECT pg_notify('schema_update', 'user_game_profiles_updated');