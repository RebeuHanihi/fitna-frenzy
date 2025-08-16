-- Create tables for the Fitna game
CREATE TABLE public.game_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL,
  owner_name TEXT NOT NULL,
  owner_pseudo TEXT NOT NULL,
  available_names TEXT[] NOT NULL,
  game_phase TEXT NOT NULL DEFAULT 'waiting' CHECK (game_phase IN ('waiting', 'writing-questions', 'playing', 'finished')),
  current_question_index INTEGER NOT NULL DEFAULT 0,
  timer INTEGER NOT NULL DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  real_name TEXT NOT NULL,
  pseudo TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  has_submitted_questions BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.game_rooms(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  target_player_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all operations for now (public game rooms)
CREATE POLICY "Game rooms are publicly accessible" 
ON public.game_rooms 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Players are publicly accessible" 
ON public.players 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Questions are publicly accessible" 
ON public.questions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_game_rooms_updated_at
  BEFORE UPDATE ON public.game_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_game_rooms_code ON public.game_rooms(code);
CREATE INDEX idx_players_room_id ON public.players(room_id);
CREATE INDEX idx_questions_room_id ON public.questions(room_id);
CREATE INDEX idx_questions_author_id ON public.questions(author_id);