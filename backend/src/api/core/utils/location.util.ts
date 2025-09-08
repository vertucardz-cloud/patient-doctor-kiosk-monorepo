type FranchiseAddress = {
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

const formatFullAddress = (addr: FranchiseAddress): string => {
  return [addr.address, addr.city, addr.state, addr.postalCode, addr.country]
    .filter((part) => part && String(part).trim().length > 0)
    .join(', ');
};

export { formatFullAddress };
