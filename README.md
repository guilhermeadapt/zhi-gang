# zhi-gang

Site e ferramentas da guild, publicados por GitHub Pages.

| Pasta | O que é |
|---|---|
| `/` | menu inicial |
| `/estrategia/` | **Game Plan** — mapa de GvG, montagem de PTs e board do roster |
| `/timer/` | War Timer — marcos da partida com narração |
| `/tank/` `/dps/` `/healer/` `/playbook/` | guias por função |

## Bot de inscrições

O bot que posta os eventos no Discord e alimenta o roster do Game Plan vive num
repositório **privado**: [`zhi-signups`](https://github.com/guilhermeadapt/zhi-signups).
Ele saiu daqui porque este repositório é público (exigência do GitHub Pages) e
não faz sentido publicar a operação junto com o site.

O acoplamento entre os dois é uma URL só, em `estrategia/config.js`:

```js
signupApis: [
  'https://inscricoes.SEUDOMINIO.com/api/v4/events/',  // o bot da guild
  'https://raid-helper.xyz/api/v4/events/',            // fallback
],
```

As bases são tentadas em ordem, então evento antigo do raid-helper e evento novo
do bot funcionam ao mesmo tempo. Nenhuma credencial vive neste repositório.
