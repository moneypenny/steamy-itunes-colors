class SteamUser
  attr_reader :steam_id, :name, :real_name, :country, :url, :avatar_small,
              :avatar_medium, :avatar_large

  def initialize player
    @steam_id = player.steamid
    @name = player.personaname
    @real_name = player.realname
    @country = player.loccountrycode
    @url = player.profileurl
    @avatar_small = player.avatar
    @avatar_medium = player.avatarmedium
    @avatar_large = player.avatarfull
  end

  def to_s
    @name || @real_name || @steam_id
  end
end
